const sopInstanceUIDs = [
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.811199116755887922789178901449'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.187727384733858550691265022399'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.357394051723501392130797480739'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.238289677653540020337853698084'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.150443339571189271569805589542'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.221610995178853884454997977307'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.124579175857031367091075947318'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.248092098922101843588419247433'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.304099113149385317633609779430'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.399502986822542899686036671993'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.198373903732820400102871457633'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.724874292423099786917778105103'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.144761744565002120966959022519'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.983420352948771516076613568660'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.259996689339127677336056207539'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.169893478123164112274408721044'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.268486968318823117395424658197'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.264249444363222407904867685684'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.307492768235041018927744186467'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.253061608933644449255079818369'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.121916112136351282516276674338'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.254561591079855258454826831167'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.261606120014771180302207425526'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.986775813633106679947869112344'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.278454503737819436544499393860'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.668657923479681875309428166518'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.177842679870688796455592410852'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.143493331384091226552591816814'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.314074369330906312228156981943'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.741551632035838598605059417892'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.170701386877664096142999818853'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.235652283132695551713618864420'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.121940445668402950209079915313'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.516029218248337255528683086734'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.327918122518679434944919852190'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.164691608352232293551260549759'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.285170539263980039747993219509'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.616830116849359295921738743135'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.257567223280764715841240058709'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.672521553333037599517146305970'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.243522054944524243018347983120'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.508494255832176097013981784771'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.161094506489141867570123067509'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.783557652489501685681377888684'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.219094153049648758520243567541'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.325535582441749168764443621948'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.181112154314749961839760377657'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.872650328930800243221454982879'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.328655778364409682577993733053'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.295745043098217868260607240709'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.265073147113725263654244996707'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.331694517803408023309210950940'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.159053351272817968225260609105'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.210452218079100310318454949711'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.263512587374912747443468148574'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.584384079669192541477773505033'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.185577707176119825195786015089'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.243921362202466918629656628377'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.795954686175510943250382476967'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.294932590865542765895969390796'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.283331812123986418604990143172'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.203288543463601618933963133200'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.285198149258542419151431864140'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.221184720506291304422784533370'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.306638026253608705423791725892'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.291519051427703467493719088747'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.151376255560641942334785756606'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.315877115167111853865432166987'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.168468894233210597103517283759'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.929659374715848366270351217933'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.707893719038372283153634209709'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.186354102336087454884146124454'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.210285977229494245047725429577'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.314095494451686272519424598772'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.979937498311813712445853645975'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.292100976136150604176948887828'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.156641565851993455370221040414'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.160797695988946497991260480783'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.247115311718733479485490634449'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.533003299459062792105348533367'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.804788321660733981450439739480'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.570212970698730570582415473084'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.192072312793652163188653274677'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.210107640659970712715089983557'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.329762277622328772202622158704'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.209107736286013000971032439131'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.174525345343623473750137039133'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.330348656940881148381958568015'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.270153968327034767048230812665'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.176656951785440746545103251672'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.313676878545892665475292585266'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.781252969770034476644053413649'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.245238681288805654997730366288'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.270768846788487349910329823287'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.521063829036906779319539839390'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.544750022868341697539859861175'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.106436364381576094553849130956'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.776579781200381696813009523978'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.147480751522787863989734329556'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.163538089513413274151628539770'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.117524976145629415852219364761'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.326501362894404968611611150621'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.242032584932805884298349822445'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.262321869081407690426678948706'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.187965525502229035776502713229'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.297667219378031873753985156489'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.318960049720539912469204951479'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.289095094837773952993682306175'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.221176528293581923965598159618'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.176299132962648435813998056517'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.108229606575148074073822881177'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.213975884596464013255919439008'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.221074519901137142076945557478'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.328714358328954551599382542053'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.193940911665342120706301425666'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.324422013690179663696760812955'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.285336950501539243105188789411'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.330139541849918930641510371197'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.164480709436970848444646278846'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.240170720566605417462705377265'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.162521525887237289087953811320'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.191812844341936534044035677980'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.204289178476442651845969898817'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.111956588469040052439624823215'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.250186874836673346438387980157'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.166038075966957308287841301631'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.427756195144408731825618696592'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.238259162382158684728084596947'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.199347090945987353639771262550'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.182923463159805805211851340088'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.300008249597220239050987686579'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.481277675926568141904758410269'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.279912426946255183252245458899'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.365199610663754442683253571848'],
  ['1.3.6.1.4.1.14519.5.2.1.7009.2403.113692692484570386248172588190'],
];

export function wadoURICreateImageIds() {
  const seriesUID =
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561';
  const studyUID =
    '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463';
  const wadoURIRoot = `https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/wado?requestType=WADO&studyUID=${studyUID}&seriesUID=${seriesUID}&contentType=application%2Fdicom`;

  const imageIds = sopInstanceUIDs.map((uid) => {
    return `wadouri:${wadoURIRoot}&objectUID=${uid}`;
  });

  return imageIds;
}

const ctImageIds = [
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000000.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000001.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000002.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000003.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000004.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000005.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000006.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000007.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000008.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/CT+CT+IMAGES/CT000009.dcm',
];

const ptImageIds = [
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000000.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000001.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000002.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000003.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000004.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000005.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000006.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000007.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000008.dcm',
  'wadouri:https://ohif-assets-new.s3.us-east-1.amazonaws.com/ACRIN-Regular/PT+PET+AC/PT000009.dcm',
];
export { ctImageIds, ptImageIds };
