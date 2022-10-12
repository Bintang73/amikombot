let casez = "ci_sessison=7378237ggvd237d3ydv37dv3d73dv73dv; fuck=828282882; date=we93283e83;"

let anj = /[^ci_session=](.*?)\w+/gi

let anj2 = /[^=](.*?)\w+/gi

let res = casez.match(anj2)[1]

console.log(res)