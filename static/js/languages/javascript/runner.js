this.Runner = class Runner {
  constructor(microvm) {
    this.microvm = microvm;
  }

  init() {
    var kd, key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    window.ctx.print = (text) => {
      return this.microvm.context.meta.print(text);
    };
    src = "";
    for (key in this.microvm.context.global) {
      kd = key;
      if (key === "Image") {
        kd = "msImage";
      }
      if (key === "Map") {
        kd = "msMap";
      }
      src += `${kd} =  window.ctx.${key};\n`;
    }
    return this.run(src);
  }

  run(program, name = "") {
    var err, file, line;
    if (!this.initialized) {
      this.init();
    }
    program += `\n//# sourceURL=${name}.js`;
    try {
      return window.eval(program);
    } catch (error) {
      err = error;
      if (err.stack != null) {      
        line = err.stack.split(".js:");
        file = line[0];
        line = line[1];
        if ((file != null) && (line != null)) {
          line = line.split(":")[0];
          if (file.lastIndexOf("(") >= 0) {
            file = file.substring(file.lastIndexOf("(") + 1);
          }
          if (file.lastIndexOf("@") >= 0) {
            file = file.substring(file.lastIndexOf("@") + 1);
          }
          this.microvm.context.location = {
            token: {
              line: line,
              column: 0
            }
          };
        }
      }
      //If the file is this file that isn't the true line number for this error
      if(file.match(/javascript\/runner/) ){
      return new Promise((resolve,reject)=>{
        let blob = new Blob([program])
        let url = URL.createObjectURL(blob)
        let w = new Worker(url)
        w.onerror = (e)=>{
          this.microvm.context.location = {
            token: {
              line: e.lineno,
              column: e.colno
            }
          };
          reject(e.message);
        }
      })
    }else{
      throw err.message
    }
    }
  }

  call(name, args) {
    var err, file, line;
    try {
      if (window[name] != null) {
        return window[name].apply(this.microvm.context.global, args);
      }
    } catch (error) {
      err = error;
      if (err.stack != null) {
        line = err.stack.split(".js:");
        file = line[0];
        line = line[1];
        if ((file != null) && (line != null)) {
          line = line.split(":")[0];
          if (file.lastIndexOf("(") >= 0) {
            file = file.substring(file.lastIndexOf("(") + 1);
          }
          if (file.lastIndexOf("@") >= 0) {
            file = file.substring(file.lastIndexOf("@") + 1);
          }
          this.microvm.context.location = {
            token: {
              line: line,
              file: file,
              column: 0
            }
          };
        }
      }
      throw err.message;
    }
  }

  toString(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "null";
    }
  }

};
