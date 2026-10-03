-- =====================================================================
-- Seed data: the squad and matches exported from the Claude version of
-- the board. Run after schema.sql. Re-running overwrites these documents.
-- =====================================================================
insert into public.board_docs (path, data) values
  ('season/squad', $doc${
 "players": [
  {
   "id": "alex",
   "name": "Alex",
   "notes": "Great runs and headers when he cuts into the box. First touch needs work.",
   "pos": [
    "LW",
    "RW",
    "CAM"
   ],
   "traits": [
    "Runs in behind",
    "Aerial threat"
   ]
  },
  {
   "id": "connor",
   "name": "Connor",
   "notes": "",
   "pos": [
    "CDM",
    "CM",
    "RB"
   ],
   "traits": []
  },
  {
   "id": "danny",
   "name": "Danny",
   "notes": "Very techy, creative runs, sticks to the ball.",
   "pos": [
    "RW",
    "CAM",
    "ST",
    "CM",
    "CDM"
   ],
   "traits": [
    "Technical",
    "Creative"
   ]
  },
  {
   "id": "david",
   "name": "David",
   "notes": "",
   "pos": [
    "RW",
    "ST"
   ],
   "traits": []
  },
  {
   "id": "donal",
   "name": "Donal",
   "notes": "",
   "pos": [
    "LB",
    "RB"
   ],
   "traits": []
  },
  {
   "id": "eliaz",
   "name": "Eliaz",
   "notes": "Tall, skinny. Plays anywhere.",
   "pos": [
    "ANY"
   ],
   "traits": [
    "Tall",
    "Versatile"
   ]
  },
  {
   "id": "felix",
   "name": "Felix",
   "notes": "Positions to confirm.",
   "pos": [],
   "traits": [
    "Short"
   ]
  },
  {
   "id": "james",
   "name": "James",
   "notes": "",
   "pos": [
    "CB",
    "RB",
    "CM",
    "LW"
   ],
   "traits": [
    "Short"
   ]
  },
  {
   "id": "joe",
   "name": "Joe",
   "notes": "Physical, better in the centre.",
   "pos": [
    "ST",
    "RW"
   ],
   "traits": [
    "Physical"
   ]
  },
  {
   "id": "john",
   "name": "John",
   "notes": "",
   "pos": [
    "RW",
    "CDM",
    "LB"
   ],
   "traits": []
  },
  {
   "id": "kristof",
   "name": "Kristof",
   "notes": "Great long balls, very present in the box.",
   "pos": [
    "GK"
   ],
   "traits": [
    "Long passing",
    "Commands box"
   ]
  },
  {
   "id": "leo",
   "name": "Leo",
   "notes": "",
   "pos": [
    "CAM"
   ],
   "traits": []
  },
  {
   "id": "liamg",
   "name": "Liam G",
   "notes": "Co-founder. Likes to push forward into the centre.",
   "pos": [
    "CB",
    "CDM",
    "CM"
   ],
   "traits": [
    "Tall",
    "Physical",
    "Aerial threat",
    "Carries forward"
   ]
  },
  {
   "id": "liamo",
   "name": "Liam O",
   "notes": "Tall, skinny, great stamina.",
   "pos": [
    "CDM",
    "LB",
    "CM"
   ],
   "traits": [
    "Tall",
    "Stamina"
   ]
  },
  {
   "id": "luke",
   "name": "Luke",
   "notes": "",
   "pos": [
    "ST",
    "CAM",
    "LW",
    "RW"
   ],
   "traits": []
  },
  {
   "id": "mark",
   "name": "Mark",
   "notes": "",
   "pos": [
    "RW",
    "CAM"
   ],
   "traits": []
  },
  {
   "id": "matthewd",
   "name": "Matthew D",
   "notes": "",
   "pos": [
    "RW",
    "LW"
   ],
   "traits": []
  },
  {
   "id": "matthewk",
   "name": "Matthew K",
   "notes": "",
   "pos": [
    "LB",
    "CDM",
    "CM"
   ],
   "traits": [
    "Short"
   ]
  },
  {
   "id": "olivier",
   "name": "Olivier",
   "notes": "",
   "pos": [
    "LB",
    "RB",
    "CB"
   ],
   "traits": []
  },
  {
   "id": "raffael",
   "name": "Raffael",
   "notes": "Co-founder.",
   "pos": [
    "RB",
    "CB"
   ],
   "traits": [
    "Tall"
   ]
  },
  {
   "id": "yacine",
   "name": "Yacine",
   "notes": "",
   "pos": [
    "CM",
    "CDM",
    "RB"
   ],
   "traits": []
  }
 ]
}$doc$::jsonb),
  ('matches/m20261003', $doc${
 "anchor": "DM2",
 "arrows": {
  "ip": [],
  "oop": []
 },
 "avail": {
  "alex": "yes",
  "connor": "no",
  "danny": "yes",
  "david": "no",
  "donal": "yes",
  "eliaz": "yes",
  "felix": "yes",
  "james": "yes",
  "joe": "yes",
  "john": "no",
  "kristof": "yes",
  "leo": "yes",
  "liamg": "yes",
  "liamo": "yes",
  "luke": "no",
  "mark": "no",
  "matthewd": "yes",
  "matthewk": "no",
  "olivier": "yes",
  "raffael": "yes",
  "yacine": "yes"
 },
 "block": "mid",
 "captain": null,
 "created": 1790903172333,
 "date": "2026-10-03",
 "fb": "RB",
 "formation": "4-2-3-1",
 "halfLen": 30,
 "halves": 2,
 "id": "m20261003",
 "lineup": {
  "AM": "leo",
  "DM1": "danny",
  "DM2": "yacine",
  "GK": "kristof",
  "LB": "donal",
  "LCB": "james",
  "LW": "alex",
  "RB": "raffael",
  "RCB": "liamg",
  "RW": "matthewd",
  "ST": "joe"
 },
 "live": {
  "ga": 0,
  "gf": 0,
  "minute": 12
 },
 "notes": "",
 "offsets": {
  "ip": {},
  "oop": {}
 },
 "opp": "Under The Bar FC",
 "oppShape": "unknown",
 "pitch": "dry",
 "result": {
  "ga": "",
  "gf": ""
 },
 "rot": {
  "blocks": 4,
  "grid": [
   {
    "AM": "leo",
    "DM1": "danny",
    "DM2": "liamo",
    "GK": "kristof",
    "LB": "olivier",
    "LCB": "james",
    "LW": "alex",
    "RB": "raffael",
    "RCB": "liamg",
    "RW": "matthewd",
    "ST": "joe"
   },
   {
    "AM": "leo",
    "DM1": "danny",
    "DM2": "liamo",
    "GK": "kristof",
    "LB": "olivier",
    "LCB": "james",
    "LW": "alex",
    "RB": "donal",
    "RCB": "liamg",
    "RW": "eliaz",
    "ST": "joe"
   },
   {
    "AM": "felix",
    "DM1": "danny",
    "DM2": "liamo",
    "GK": "kristof",
    "LB": "olivier",
    "LCB": "james",
    "LW": "matthewd",
    "RB": "yacine",
    "RCB": "liamg",
    "RW": "eliaz",
    "ST": "joe"
   }
  ],
  "spine": true
 },
 "sp": {
  "back1": "james",
  "back2": "donal",
  "cornerL": "danny",
  "cornerR": "leo",
  "dEdge": "danny",
  "dMark1": "liamg",
  "dMark2": "alex",
  "dNear": "joe",
  "dOut": "matthewd",
  "edge": "yacine",
  "far": "alex",
  "fk": "danny",
  "near": "joe",
  "pen": "matthewd",
  "spot": "liamg"
 },
 "style": "unknown",
 "time": "13:00",
 "venue": "Thornfield 1",
 "vice": null,
 "width": "normal"
}$doc$::jsonb)
on conflict (path) do update set data = excluded.data;
