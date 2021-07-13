class @PixelArtScaler
  constructor:()->

  rescale:(canvas,width,height)->
    if width>canvas.width or height>canvas.height
      @rescale @triplePix(canvas),width,height
    else
      c = document.createElement "canvas"
      c.width = width
      c.height = height
      context = c.getContext("2d")
      context.drawImage canvas,0,0,width,height
      c

  distance:(data,i1,i2)->
    return 0 if i1*4>data.length or i2*4>data.length or i1<0 or i2<0
    dx = Math.abs(data[i1*4]-data[i2*4])
    dy = Math.abs(data[i1*4+1]-data[i2*4+1])
    dz = Math.abs(data[i1*4+2]-data[i2*4+2])
    dw = Math.abs(data[i1*4+3]-data[i2*4+3])
    Math.max(dx,dy,dz,dw)

  inter:(data,i1,i2,res,inter)->
    data[res*4] = data[i1*4]*(1-inter)+data[i2*4]*inter
    data[res*4+1] = data[i1*4+1]*(1-inter)+data[i2*4+1]*inter
    data[res*4+2] = data[i1*4+2]*(1-inter)+data[i2*4+2]*inter
    data[res*4+3] = data[i1*4+3]*(1-inter)+data[i2*4+3]*inter

  inter4:(data,i1,i2,i3,i4,res,a,b)->
    data[res*4] = (1-b)*(data[i1*4]*(1-a)+data[i2*4]*a)+b*(data[i3*4]*(1-a)+data[i4*4]*a)
    data[res*4+1] = (1-b)*(data[i1*4+1]*(1-a)+data[i2*4+1]*a)+b*(data[i3*4+1]*(1-a)+data[i4*4+1]*a)
    data[res*4+2] = (1-b)*(data[i1*4+2]*(1-a)+data[i2*4+2]*a)+b*(data[i3*4+2]*(1-a)+data[i4*4+2]*a)
    data[res*4+3] = (1-b)*(data[i1*4+3]*(1-a)+data[i2*4+3]*a)+b*(data[i3*4+3]*(1-a)+data[i4*4+3]*a)

  tripleSmoothing:(canvas)->
    context = canvas.getContext("2d")
    data = context.getImageData(0,0,canvas.width,canvas.height)

    threshold = 64

    #gradient pass
    for i in [1..canvas.width-4] by 3
      for j in [1..canvas.height-4] by 3
        i1 = i+j*canvas.width
        i2 = (i+3)+j*canvas.width
        i3 = i+(j+3)*canvas.width
        i4 = (i+3)+(j+3)*canvas.width
        d = @distance(data.data,i1,i2)+@distance(data.data,i3,i4)+@distance(data.data,i1,i3)+@distance(data.data,i2,i4)

        if d<threshold*2
          for k in [0..3] by 1
            for l in [0..3] by 1
              @inter4 data.data,i1,i2,i3,i4,(i+k)+(j+l)*canvas.width,k/3,l/3

    # diagonals pass
    for i in [1..canvas.width-4] by 3
      for j in [1..canvas.height-4] by 3
        i1 = i+j*canvas.width
        i2 = (i+3)+(j+3)*canvas.width
        i3 = i+3+j*canvas.width
        i4 = i+(j+3)*canvas.width
        d1 = @distance(data.data,i1,i2)
        d2 = @distance(data.data,i3,i4)

        diag1 = not ((i == canvas.width-6+1 and j == 1) or (i == 1 and j == canvas.height-6+1))
        diag2 = not ((i == 1 and j == 1) or (i == canvas.width-6+1 and j == canvas.height-6+1))

        if d1<threshold and d2>=threshold and diag1
          @inter data.data,i1,i2,(i+2)+(j+1)*canvas.width,.5
          @inter data.data,i1,i2,(i+1)+(j+2)*canvas.width,.5
          @inter data.data,i1,i2,(i+1)+(j+1)*canvas.width,1/3
          @inter data.data,i1,i2,(i+2)+(j+2)*canvas.width,2/3
          if @distance(data.data,i1,i1-3*canvas.width)<threshold and @distance(data.data,i3,i3-3*canvas.width)<threshold
            @inter data.data,i1,i2,(i+2)+j*canvas.width,.5
          if @distance(data.data,i2,i2+3*canvas.width)<threshold and @distance(data.data,i4,i4+3*canvas.width)<threshold
            @inter data.data,i1,i2,(i+1)+(j+3)*canvas.width,.5
          if @distance(data.data,i1,i1-3)<threshold and @distance(data.data,i4,i4-3)<threshold
            @inter data.data,i1,i2,i+(j+2)*canvas.width,.5
          if @distance(data.data,i2,i2+3)<threshold and @distance(data.data,i3,i3+3)<threshold
            @inter data.data,i1,i2,(i+3)+(j+1)*canvas.width,.5
        else if d2<threshold and d1>=threshold and diag2
          @inter data.data,i3,i4,(i+1)+(j+1)*canvas.width,.5
          @inter data.data,i3,i4,(i+2)+(j+2)*canvas.width,.5
          @inter data.data,i3,i4,(i+2)+(j+1)*canvas.width,1/3
          @inter data.data,i3,i4,(i+1)+(j+2)*canvas.width,2/3
          if @distance(data.data,i3,i3-3*canvas.width)<threshold and @distance(data.data,i1,i1-3*canvas.width)<threshold
            @inter data.data,i3,i4,i3-2,.5
          if @distance(data.data,i4,i4+3*canvas.width)<threshold and @distance(data.data,i2,i2+3*canvas.width)<threshold
            @inter data.data,i3,i4,i4+2,.5
          if @distance(data.data,i3,i3+3)<threshold and @distance(data.data,i2,i2+3)<threshold
            @inter data.data,i3,i4,i3+2*canvas.width,.5
          if @distance(data.data,i4,i4-3)<threshold and @distance(data.data,i1,i1-3)<threshold
            @inter data.data,i3,i4,i4-2*canvas.width,.5
        else if d1<threshold and d2<threshold
          dd1 = @distance(data.data,i1,(i-3)+j*canvas.width)+
            @distance(data.data,i1,i+(j-3)*canvas.width)+
            @distance(data.data,i1,i+6+(j+3)*canvas.width)+
            @distance(data.data,i1,i+3+(j+6)*canvas.width)

          dd2 = @distance(data.data,i3,i-3+(j+3)*canvas.width)+
            @distance(data.data,i3,i+(j+6)*canvas.width)+
            @distance(data.data,i3,i+3+(j-3)*canvas.width)+
            @distance(data.data,i3,i+6+j*canvas.width)

          if dd2<dd1 and diag1
            @inter data.data,i1,i2,(i+2)+(j+1)*canvas.width,.5
            @inter data.data,i1,i2,(i+1)+(j+2)*canvas.width,.5
            @inter data.data,i1,i2,(i+1)+(j+1)*canvas.width,1/3
            @inter data.data,i1,i2,(i+2)+(j+2)*canvas.width,2/3
            if @distance(data.data,i1,i1-3*canvas.width)<threshold and @distance(data.data,i3,i3-3*canvas.width)<threshold
              @inter data.data,i1,i2,(i+2)+j*canvas.width,.5
            if @distance(data.data,i2,i2+3*canvas.width)<threshold and @distance(data.data,i4,i4+3*canvas.width)<threshold
              @inter data.data,i1,i2,(i+1)+(j+3)*canvas.width,.5
            if @distance(data.data,i1,i1-3)<threshold and @distance(data.data,i4,i4-3)<threshold
              @inter data.data,i1,i2,i+(j+2)*canvas.width,.5
            if @distance(data.data,i2,i2+3)<threshold and @distance(data.data,i3,i3+3)<threshold
              @inter data.data,i1,i2,(i+3)+(j+1)*canvas.width,.5
          else if dd1<dd2 and diag2
            @inter data.data,i3,i4,(i+1)+(j+1)*canvas.width,.5
            @inter data.data,i3,i4,(i+2)+(j+2)*canvas.width,.5
            @inter data.data,i3,i4,(i+2)+(j+1)*canvas.width,1/3
            @inter data.data,i3,i4,(i+1)+(j+2)*canvas.width,2/3
            if @distance(data.data,i3,i3-3*canvas.width)<threshold and @distance(data.data,i1,i1-3*canvas.width)<threshold
              @inter data.data,i3,i4,i3-2,.5
            if @distance(data.data,i4,i4+3*canvas.width)<threshold and @distance(data.data,i2,i2+3*canvas.width)<threshold
              @inter data.data,i3,i4,i4+2,.5
            if @distance(data.data,i3,i3+3)<threshold and @distance(data.data,i2,i2+3)<threshold
              @inter data.data,i3,i4,i3+2*canvas.width,.5
            if @distance(data.data,i4,i4-3)<threshold and @distance(data.data,i1,i1-3)<threshold
              @inter data.data,i3,i4,i4-2*canvas.width,.5

    context.putImageData data,0,0
    canvas

  triplePix: (canvas)->
    c = document.createElement "canvas"
    c.width = (canvas.width+2)*3
    c.height = (canvas.height+2)*3
    context = c.getContext("2d")
    context.imageSmoothingEnabled = false
    context.drawImage canvas,3,3,c.width-6,c.height-6
    @tripleSmoothing(c)
    canvas = document.createElement "canvas"
    canvas.width = c.width-6
    canvas.height = c.height-6
    context = canvas.getContext("2d")
    context.drawImage c,-3,-3
    canvas
