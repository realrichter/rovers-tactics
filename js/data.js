"use strict";

/* ================= DATA ================= */
const SLOTS=['GK','LB','LCB','RCB','RB','DM1','DM2','AM','LW','RW','ST'];
const SPINE=['GK','LCB','RCB','DM1'];
const POS_CODES=['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST','ANY'];
const TRAITS=['Tall','Short','Physical','Stamina','Technical','Creative','Aerial threat','Runs in behind','Long passing','Commands box','Carries forward','Versatile','Pace'];

// x: 0 left touchline to 100 right; y: 0 their goal line to 100 ours (we attack upwards)
const FORM={
 '4-2-3-1':{four:true,pivot:true,
  lab:{GK:'GK',LB:'LB',LCB:'CB',RCB:'CB',RB:'RB',DM1:'DM',DM2:'DM',AM:'AM',LW:'LW',RW:'RW',ST:'ST'},
  ip:{GK:[50,91],LB:[14,63],LCB:[35,71],RCB:[65,71],RB:[86,63],DM1:[41,53],DM2:[59,53],AM:[50,34],LW:[11,26],RW:[89,26],ST:[50,17]},
  oop:{GK:[50,94],LB:[17,75],LCB:[39,78],RCB:[61,78],RB:[83,75],DM1:[41,61],DM2:[59,61],AM:[50,46],LW:[16,58],RW:[84,58],ST:[50,37]},
  oopName:'4-4-1-1',ipName:'3-2-5 when a fullback goes',
  desc:'Two holding midfielders protect the back four, a number 10 links play, and a lone striker leads the press. The most balanced starting point.'},
 '4-3-3':{four:true,
  lab:{GK:'GK',LB:'LB',LCB:'CB',RCB:'CB',RB:'RB',DM1:'DM',AM:'CM',DM2:'CM',LW:'LW',RW:'RW',ST:'ST'},
  ip:{GK:[50,91],LB:[14,62],LCB:[36,71],RCB:[64,71],RB:[86,62],DM1:[50,55],AM:[34,37],DM2:[66,37],LW:[10,22],RW:[90,22],ST:[50,15]},
  oop:{GK:[50,94],LB:[17,76],LCB:[39,79],RCB:[61,79],RB:[83,76],DM1:[50,65],AM:[37,53],DM2:[63,53],LW:[16,51],RW:[84,51],ST:[50,37]},
  oopName:'4-1-4-1',ipName:'2-3-5 with fullbacks on',
  desc:'One holder, two box-to-box midfielders and a front three. Built to attack and press high; needs the fullbacks to have legs.'},
 '4-4-2':{four:true,pivot:true,
  lab:{GK:'GK',LB:'LB',LCB:'CB',RCB:'CB',RB:'RB',DM1:'CM',DM2:'CM',AM:'ST',LW:'LM',RW:'RM',ST:'ST'},
  ip:{GK:[50,91],LB:[14,62],LCB:[36,71],RCB:[64,71],RB:[86,62],DM1:[42,50],DM2:[58,50],LW:[11,32],RW:[89,32],AM:[58,19],ST:[42,17]},
  oop:{GK:[50,94],LB:[17,76],LCB:[39,79],RCB:[61,79],RB:[83,76],DM1:[42,61],DM2:[58,61],LW:[16,60],RW:[84,60],AM:[57,41],ST:[43,39]},
  oopName:'4-4-2 block',ipName:'4-2-4 when the wide men go',
  desc:'Two banks of four and a strike pair. The easiest shape to coach and the hardest to play through when compact.'},
 '4-1-2-1-2':{four:true,
  lab:{GK:'GK',LB:'LB',LCB:'CB',RCB:'CB',RB:'RB',DM1:'DM',LW:'CM',DM2:'CM',AM:'AM',RW:'ST',ST:'ST'},
  ip:{GK:[50,91],LB:[10,50],LCB:[36,72],RCB:[64,72],RB:[90,50],DM1:[50,60],LW:[33,42],DM2:[67,42],AM:[50,29],RW:[60,16],ST:[40,16]},
  oop:{GK:[50,94],LB:[19,76],LCB:[39,79],RCB:[61,79],RB:[81,76],DM1:[50,66],LW:[33,57],DM2:[67,57],AM:[50,46],RW:[60,37],ST:[40,37]},
  oopName:'4-3-1-2',ipName:'diamond, fullbacks give the width',
  desc:'A narrow diamond: four central midfielders win the middle of the pitch, the fullbacks provide all the width.'},
 '4-1-4-1':{four:true,
  lab:{GK:'GK',LB:'LB',LCB:'CB',RCB:'CB',RB:'RB',DM1:'DM',AM:'CM',DM2:'CM',LW:'LM',RW:'RM',ST:'ST'},
  ip:{GK:[50,91],LB:[14,62],LCB:[36,71],RCB:[64,71],RB:[86,62],DM1:[50,56],AM:[37,39],DM2:[63,39],LW:[11,28],RW:[89,28],ST:[50,16]},
  oop:{GK:[50,94],LB:[17,77],LCB:[39,80],RCB:[61,80],RB:[83,77],DM1:[50,68],AM:[38,56],DM2:[62,56],LW:[15,55],RW:[85,55],ST:[50,40]},
  oopName:'4-1-4-1 block',ipName:'4-3-3',
  desc:'A flat four in front of one holder. Very compact, hard to play through, and good against strong wingers.'},
 '3-5-2':{
  lab:{GK:'GK',LB:'LWB',LCB:'CB',DM1:'CB',RCB:'CB',RB:'RWB',DM2:'DM',AM:'CM',RW:'CM',LW:'ST',ST:'ST'},
  ip:{GK:[50,91],LB:[8,36],LCB:[29,70],DM1:[50,74],RCB:[71,70],RB:[92,36],DM2:[50,54],AM:[33,40],RW:[67,40],LW:[41,17],ST:[59,17]},
  oop:{GK:[50,94],LB:[10,73],LCB:[32,79],DM1:[50,81],RCB:[68,79],RB:[90,73],DM2:[50,63],AM:[35,57],RW:[65,57],LW:[42,39],ST:[58,39]},
  oopName:'5-3-2',ipName:'3-5-2, wing-backs high',
  desc:'Three centre backs and wing-backs. Strong in the middle and in the air; the wing-backs must run all day.'},
 '5-4-1':{
  lab:{GK:'GK',LB:'LWB',LCB:'CB',DM1:'CB',RCB:'CB',RB:'RWB',AM:'CM',DM2:'CM',LW:'LM',RW:'RM',ST:'ST'},
  ip:{GK:[50,91],LB:[10,50],LCB:[32,72],DM1:[50,75],RCB:[68,72],RB:[90,50],AM:[40,52],DM2:[60,52],LW:[18,31],RW:[82,31],ST:[50,19]},
  oop:{GK:[50,94],LB:[10,77],LCB:[31,80],DM1:[50,82],RCB:[69,80],RB:[90,77],AM:[40,64],DM2:[60,64],LW:[15,63],RW:[85,63],ST:[50,44]},
  oopName:'5-4-1 low block',ipName:'3-4-3 on the break',
  desc:'Five at the back and four in front. A shape for seeing out a lead, not for chasing a game.'}
};
const FORM_ORDER=['4-2-3-1','4-3-3','4-4-2','4-1-2-1-2','4-1-4-1','3-5-2','5-4-1'];
const OPP_SHAPES=['unknown','4-4-2','4-3-3','4-2-3-1','3-5-2','5-4-1','4-1-2-1-2'];

const CODE_OF={GK:'GK',LB:'LB',RB:'RB',LWB:'LB',RWB:'RB',CB:'CB',DM:'CDM',CM:'CM',AM:'CAM',LW:'LW',RW:'RW',LM:'LW',RM:'RW',ST:'ST'};
const ADJ={GK:[],CB:['CDM','LB','RB'],LB:['RB','CB'],RB:['LB','CB'],CDM:['CM','CB'],CM:['CDM','CAM'],CAM:['CM','ST','LW','RW'],LW:['RW','CAM','ST'],RW:['LW','CAM','ST'],ST:['CAM','LW','RW']};
const LABEL_FULL={GK:'Goalkeeper',LB:'Left back',RB:'Right back',LWB:'Left wing-back',RWB:'Right wing-back',CB:'Centre back',DM:'Holding midfielder',CM:'Central midfielder',AM:'Number 10',LW:'Left winger',RW:'Right winger',LM:'Left midfielder',RM:'Right midfielder',ST:'Striker'};
const FIT_TXT={natural:'Preferred position',listed:'Listed position',cover:'Can cover',out:'Out of position',unknown:'No positions listed'};

const STYLES={
 unknown:{label:'Not scouted',f:'4-2-3-1',block:'mid',width:'normal',fb:'one',anchor:'one',
  sum:'Start balanced and read them in the first ten minutes.',
  tips:['<b>Scout early.</b> Count their back line (four or five?) and their central midfielders (two or three?). The bench calls it out by the 10th minute.',
        '<b>Find the weak link.</b> The slowest defender, the midfielder who hides from the ball. Play towards him all game.',
        '<b>Asymmetric build-up.</b> {fbGo} pushes on, the other fullback tucks in to make a back three. Two centre backs and a holding midfielder always stay behind the ball.']},
 press:{label:'Presses high',f:'4-2-3-1',block:'mid',width:'wide',fb:'none',anchor:'both',
  sum:'They squeeze our build-up. Beat the first line and they are wide open behind it.',
  tips:['<b>Stretch the press.</b> Centre backs split to the corners of the box, fullbacks hold the touchline. Pressers have more ground to cover.',
        '<b>Use the keeper as the spare man.</b> If they press with two, we build with three: {LCB}, {RCB} and {GK}.',
        '<b>Third-man passes beat a press.</b> {RB} into {DM2}, first time into {AM}, with {RW} running beyond.',
        '<b>No time on the ball? Go long.</b> {GK} hits {ST} or the channels early; the midfield lives on the second ball.']},
 direct:{label:'Long balls',f:'4-2-3-1',block:'deep',width:'normal',fb:'none',anchor:'both',
  sum:'They go over the top and chase knock-downs.',
  tips:['<b>Drop the line five yards.</b> Defend balls in front of you, never over your head.',
        '<b>One attacks, one covers.</b> {LCB} and {RCB}: the nearer one heads it, the other drops in behind. Call it early.',
        '<b>Own the second ball.</b> {HOLD} and {DM2} sit ten yards in front of the centre backs to collect knock-downs.',
        '<b>Punish the shape.</b> After a long ball their team is stretched. Win it, then play quickly on the floor through the gaps.']},
 possession:{label:'Keeps the ball',f:'4-4-2',block:'mid',width:'narrow',fb:'none',anchor:'one',
  sum:'They pass it around patiently and wait for a gap.',
  tips:['<b>Mid block, not a chase.</b> Two banks of four with 10 to 15 yards between the lines. Let them have it in front of us.',
        '<b>Curved pressing runs.</b> {ST} and {AM} block the pass into their holding midfielder with their run and force play wide.',
        '<b>Press on a trigger, together.</b> A backwards pass, a heavy touch or a pass to the touchline: everyone jumps at once.',
        '<b>Counter into the space they leave.</b> Their fullbacks will be high. Win it and hit the channel behind them immediately.']},
 lowblock:{label:'Sits deep',f:'4-3-3',block:'high',width:'wide',fb:'both',anchor:'one',
  sum:'They defend in numbers and wait to break.',
  tips:['<b>Width and patience.</b> {LW} and {RW} stay on the touchline to stretch the block; switch play quickly to make them shuffle.',
        '<b>One player per lane.</b> When a fullback overlaps, his winger comes inside into the half-space.',
        '<b>Rest defence.</b> {LCB}, {RCB} and {HOLD} always stay behind the ball so their break meets three.',
        '<b>Cutbacks, not hopeful crosses.</b> Get to the byline and pull it back to the penalty spot or the edge of the box.',
        '<b>Five-second counter-press.</b> When we lose it high, the nearest three win it back before they can break.']},
 counter:{label:'Quick on the break',f:'4-2-3-1',block:'mid',width:'normal',fb:'none',anchor:'both',
  sum:'They sit and spring forward the moment they win it.',
  tips:['<b>Rest defence first.</b> Always five behind the ball: the back four plus {HOLD}, or the centre backs plus both holders.',
        '<b>Delay, do not dive.</b> When we lose it, the nearest player slows the ball carrier while everyone else sprints back.',
        '<b>Finish every attack.</b> A shot or a ball out of play is fine; a cheap turnover in midfield is not.',
        '<b>Set pieces:</b> leave two plus {GK} back on our corners and wide free kicks.']},
 wide:{label:'Strong wingers',f:'4-1-4-1',block:'mid',width:'normal',fb:'none',anchor:'one',
  sum:'Their danger is pace and crosses from wide.',
  tips:['<b>Double up.</b> {LW} and {RW} track back so it is always two against their winger.',
        '<b>Show them outside</b>, away from goal and onto their weaker foot. Stay on your feet.',
        '<b>Cover the gap.</b> {HOLD} shuffles across when a fullback is beaten; the centre backs stay central for the cross.',
        '<b>Cut the supply.</b> Press their fullback as he receives, so the winger gets it under pressure.']},
 physical:{label:'Big and physical',f:'4-3-3',block:'mid',width:'wide',fb:'one',anchor:'one',
  sum:'They are stronger in the air and in the duels.',
  tips:['<b>Keep it on the floor.</b> Every aerial duel we avoid is one we cannot lose.',
        '<b>Make them turn.</b> Quick one-twos and switches of play drag bigger, slower players around.',
        '<b>No fouls around our box.</b> Their set pieces are the danger. Win the first contact on corners or clear it high and wide.',
        '<b>{GK} owns the six-yard box.</b> Come for crosses early and loudly.']},
 weak:{label:'Disorganised',f:'4-3-3',block:'high',width:'wide',fb:'both',anchor:'one',
  sum:'They struggle under pressure and lose their shape.',
  tips:['<b>Press high and as a unit.</b> Their defenders will make mistakes when hurried.',
        '<b>Win it high, finish fast.</b> Three passes and a shot.',
        '<b>Keep the press fresh.</b> Rotate the front five every 15 minutes with rolling subs.',
        '<b>Stay disciplined.</b> {LCB}, {RCB} and {HOLD} stay home even when we are on top.']}
};
const STYLE_ORDER=['unknown','press','direct','possession','lowblock','counter','wide','physical','weak'];

const SHAPE_TIPS={
 unknown:'<b>Their shape:</b> not known yet. Set it here once you have counted them and the overload map will show where we have the spare man.',
 '4-4-2':'<b>Against their 4-4-2:</b> their two central midfielders face our three. {AM} is the free man between their lines: get it into him early. Their front two press our centre backs, so a third man ({HOLD} dropping in or {GK}) gives us a 3 v 2 in build-up.',
 '4-3-3':'<b>Against their 4-3-3:</b> their front three go 3 v 2 against our centre backs. Keep the far fullback deeper or drop {HOLD} between the centre backs. Their fullbacks push on, so the space behind them is where {LW} and {RW} break into.',
 '4-2-3-1':'<b>Against their 4-2-3-1:</b> a mirror match, so individual duels decide it. Drag one of their holders out with {AM} dropping short, then run {ST} into the gap behind.',
 '3-5-2':'<b>Against their 3-5-2:</b> their wing-backs are their only width. Pin them back with {LW} and {RW} staying high; a fullback overlap then makes 2 v 1 on the flank. Their back three is exposed in the channels.',
 '5-4-1':'<b>Against their 5-4-1:</b> they will sit deep with five. Switch play quickly, use cutbacks to the edge of the box and dominate the second balls.',
 '4-1-2-1-2':'<b>Against their diamond:</b> they are narrow and have no wingers. Our fullbacks have space; get them on the ball high and wide, and make their fullbacks defend 2 v 1.'
};

const SQUAD_DEFAULT=[
 {id:'alex',name:'Alex',pos:['LW','RW','CAM'],traits:['Runs in behind','Aerial threat'],notes:'Great runs and headers when he cuts into the box. First touch needs work.'},
 {id:'connor',name:'Connor',pos:['CDM','CM','RB'],traits:[],notes:''},
 {id:'danny',name:'Danny',pos:['RW','CAM','ST'],traits:['Technical','Creative'],notes:'Very techy, creative runs, sticks to the ball.'},
 {id:'david',name:'David',pos:['RW','ST'],traits:[],notes:''},
 {id:'donal',name:'Donal',pos:['LB','RB'],traits:[],notes:''},
 {id:'eliaz',name:'Eliaz',pos:['ANY'],traits:['Tall','Versatile'],notes:'Tall, skinny. Plays anywhere.'},
 {id:'felix',name:'Felix',pos:[],traits:['Short'],notes:'Positions to confirm.'},
 {id:'james',name:'James',pos:['CB','RB','CM','LW'],traits:['Short'],notes:''},
 {id:'joe',name:'Joe',pos:['ST','RW'],traits:['Physical'],notes:'Physical, better in the centre.'},
 {id:'john',name:'John',pos:['RW','CDM','LB'],traits:[],notes:''},
 {id:'kristof',name:'Kristof',pos:['GK'],traits:['Long passing','Commands box'],notes:'Great long balls, very present in the box.'},
 {id:'leo',name:'Leo',pos:['CAM'],traits:[],notes:''},
 {id:'liamg',name:'Liam G',pos:['CB','CDM','CM'],traits:['Physical','Tall','Carries forward'],notes:'Co-founder. Likes to push forward into the centre.'},
 {id:'liamo',name:'Liam O',pos:['CDM','LB','CM'],traits:['Tall','Stamina'],notes:'Tall, skinny, great stamina.'},
 {id:'luke',name:'Luke',pos:['ST','CAM','LW','RW'],traits:[],notes:''},
 {id:'mark',name:'Mark',pos:['RW','CAM'],traits:[],notes:''},
 {id:'matthewd',name:'Matthew D',pos:['RW','LW'],traits:[],notes:''},
 {id:'matthewk',name:'Matthew K',pos:['LB','CDM','CM'],traits:['Short'],notes:''},
 {id:'olivier',name:'Olivier',pos:['LB','RB','CB'],traits:[],notes:''},
 {id:'raffael',name:'Raffael',pos:['RB','CB'],traits:[],notes:'Co-founder.'},
 {id:'yacine',name:'Yacine',pos:['CM','CDM','RB'],traits:[],notes:''}
];
const OCT3_AVAIL={alex:'yes',connor:'no',danny:'yes',david:'no',donal:'yes',eliaz:'yes',felix:'yes',james:'yes',joe:'yes',john:'no',kristof:'yes',leo:'yes',liamg:'yes',liamo:'yes',luke:'no',mark:'no',matthewd:'yes',matthewk:'no',olivier:'yes',raffael:'yes',yacine:'yes'};

function defaultMatch(){
 return {id:'m20261003',opp:'TBC',date:'2026-10-03',time:'',venue:'',halfLen:30,halves:2,
  style:'unknown',oppShape:'unknown',pitch:'dry',
  avail:Object.assign({},OCT3_AVAIL),
  formation:'4-2-3-1',
  lineup:{GK:'kristof',LB:'donal',LCB:'james',RCB:'liamg',RB:'raffael',DM1:'danny',DM2:'yacine',AM:'leo',LW:'alex',RW:'matthewd',ST:'joe'},
  captain:'raffael',vice:'liamg',
  block:'mid',width:'normal',fb:'RB',anchor:'DM2',
  offsets:{ip:{},oop:{}},arrows:{ip:[],oop:[]},
  live:{gf:0,ga:0,minute:0},
  sp:{},rot:{blocks:4,spine:true,grid:[]},
  notes:'',result:{gf:'',ga:''},created:Date.now()};
}
