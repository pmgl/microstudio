`
const TWOPI = 2*Math.PI
const SIN_TABLE = new Float64Array(10001)
const WHITE_NOISE = new Float64Array(100000)
const COLORED_NOISE = new Float64Array(100000)
`
do ->
  for i in [0..10000] by 1
    SIN_TABLE[i] = Math.sin(i/10000*Math.PI*2)

`
const BLIP_SIZE = 512
const BLIP = new Float64Array(BLIP_SIZE+1)
`

do ->
  for p in [1..31] by 2
    for i in [0..BLIP_SIZE] by 1
      x = (i/BLIP_SIZE-.5)*.5
      BLIP[i] += Math.sin(x*2*Math.PI*p)/p

  norm = BLIP[BLIP_SIZE]

  for i in [0..BLIP_SIZE] by 1
    BLIP[i] /= norm

do ->
  n = 0
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0
  for i in [0..99999] by 1
    white = Math.random()*2-1

    n = .99*n+.01*white

    pink = n*6

    WHITE_NOISE[i] = white
    COLORED_NOISE[i] = pink

DBSCALE = (value,range)-> (Math.exp(value*range)/Math.exp(range)-1/Math.exp(range))/(1-1/Math.exp(range))
