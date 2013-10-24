String::codePointAt ?= (pos=0) ->
  str = String @
  code = str.charCodeAt(pos)
  if 0xD800 <= code <= 0xDBFF
    next = str.charCodeAt(pos + 1)
    if 0xDC00 <= next <= 0xDFFF
      return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000
  return code;

require! fs
const CharComp = require \./char_comp.json
const TotalStrokes = require \./total-strokes.json

out =
  comps:
    strokes-unknown: []
  get: (char) ->
    if not @comps[char]
      @comps[char] = {}
    @comps[char]

for own char, comps of CharComp
  strokes = 0
  for comp in comps
    lookup = out.get comp.c
    lookup[char] = strokes
    comp-strokes = TotalStrokes[comp.c.codePointAt(0)]
    out.comps.strokes-unknown.push comp.c if not comp-strokes
    strokes += comp-strokes

console.log out.comps
