import { Platform } from 'react-native';

let GlobalKeys = {
  barColor: '#006064',
  dataPicker: '#007b80', //Simbòlic, el canvi s'ha de fer a res/values/styles.xml
  itemsBarColor: '#FFFFFF',
  statusBarColor: '#00474a',
  hrColor: '#90A4AE',
  switchColor: '#007b80',
  screensBackgroundColor: 'white',

  size1: 15,
  size2: 18,
  size3: 21,
  size4: 24,
  size5: 27,
  size6: 30,
  size7: 33,
  size8: 36,
  size9: 39,
  size10: 42,

  late_prayer: 3,
  afternoon_hour: 18,

  paddingBar: Platform.OS === 'ios' ? 0 : 54,

  server_url: 'https://serveditorial.cpl.es/api/emp/read/'

}

export default GlobalKeys;