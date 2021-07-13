x = 5

test = function(y)
  local s = ""
  for i in 1 to y
    print(i)
  end
end

test(x)

i = 0
level_names = while i<10 i = i+1 "level "+i end

print(for i in 1 to 10 "level "+i end)


map = object
  x = 0
  y = 0
end

map.x == map["x"]

empty = object end

shape = class(sides=3)
  sides = sides
  x = 0
  y = 0
end

square = class() from shape
  _parent(4)
  x = 2
  y = 2
end

s = new square(4)

do in 1000 status = "play" end

timer = function()
  if countdown>0 then in 1000 do timer() end end
  countdown = countdown-1
end
