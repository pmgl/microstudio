diff = (before,after)->
  if typeof before == "string" then before = before.split("\n")
  if typeof after == "string" then after = after.split("\n")

  result = []
  map = {}

  for line,i in before
    list = map[line]
    if not list? then list = map[line] = []
    list.push(i)

  length = (bi,ai)->
    len = 0
    while bi < before.length and ai < after.length and before[bi++] == after[ai++]
      len += 1
    len

  best_bi = best_ai = best_length = 0

  for line,ai in after
    list = map[line]
    if list?
      for bi in list
        score = length(bi,ai)
        if score > best_length
          best_bi = bi
          best_ai = ai
          best_length = score

  if best_length == 0
    if before.length > 0 then result.push { type: "-", data: before }
    if after.length > 0 then result.push { type: "+", data: after }
    return result
  else
    return [].concat( diff(before.slice(0,best_bi),after.slice(0,best_ai)) ,
                      [ { type: "=", data: after.slice(best_ai,best_ai + best_length)} ],
                      diff(before.slice(best_bi+best_length,before.length),after.slice(best_ai+best_length,after.length)) )