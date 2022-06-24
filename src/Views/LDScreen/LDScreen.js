import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import * as Logger from '../../Utils/Logger';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter'
import HR from '../../Components/HRComponent';
import GLOBALS from '../../Utils/GlobalKeys';
import { MassLiturgyData, GlobalData } from '../../Services/DataService';

const VESPERS_SELECTOR_TYPES = {
  NORMAL: 'normal',
  VESPERS: 'vespers'
}

export default class LDScreen extends Component {
  //PREVIEWS --------------------------------------------------------------------------
  UNSAFE_componentWillMount() {
    this.eventEmitter = new EventEmitter();
  }

  componentDidMount() {
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.Refresh_Layout());
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  Refresh_Layout() {

    try {
      this.CURRENT_VESPERS_SELECTOR = (!MassLiturgyData.VetllaPasqua && MassLiturgyData.Vespers && GlobalData.date.getHours() >= GLOBALS.afternoon_hour && MassLiturgyData.Lectura2Vespers != '-')? VESPERS_SELECTOR_TYPES.VESPERS : VESPERS_SELECTOR_TYPES.NORMAL;

      this.setState({
        need_lectura2: (this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.NORMAL && MassLiturgyData.Lectura2 != '-') || (this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS && MassLiturgyData.Lectura2Vespers != '-')
      });
  
    } catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Refresh_Layout", error);
      this.setState( { renderError: true } )
    }
   
  }

  //CONSTRUCTOR --------------------------------------------------------------------------
  constructor(props) {
    super(props);

    this.state = { renderError: false }
  }

  //CALLBACKS ----------------------------------------------------------------------------
  On_Button_Pressed(prayer_type, need_lectura2) {
    var title = "Missa";

    var params = {
      title: title,
      props: {
        type: prayer_type,
        emitShareCB: this.emitShare.bind(this),
        events: this.eventEmitter,
        need_lectura2: need_lectura2,
        useVespersTexts: this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS
      },
    }
    this.props.navigation.navigate('LDDisplay', params);
  }

  emitShare() {
  }

  //RENDER -------------------------------------------------------------------------------
  render() {
    try {

      if(this.state == null){
        this.Refresh_Layout()
        return false
      }

      if(this.state.renderError){
        return (
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={{textAlign: 'center', color: 'black', fontSize: 20, fontWeight: 'normal'}}>
              {"Ha sorgit un error inesperat."}
            </Text>
          </View>
        )
      }

      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: GLOBALS.screensBackgroundColor }}>
            {
               <ImageBackground source={require('../../Assets/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
               {MassLiturgyData.Vespers == undefined ?
                 null :
                 <View style={{ flex: 1, }}>
                   {MassLiturgyData.Vespers ?
                     <View style={styles.liturgiaContainerVespers}>
                       {this.VespersSelector()}
                     </View>
                     :
                     null}
                   <View style={this.state.need_lectura2 ? styles.liturgiaContainer_need_lectura2 : styles.liturgiaContainer}>
                     {this.Buttons(this.state.need_lectura2)}
                   </View>
                 </View>
               }
             </ImageBackground>
            }
        </SafeAreaView>
      );

    } catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "render", error);
      return null
    }
  }

  VespersSelector() {
    try {
      if (MassLiturgyData.Vespers) {
        return (
          <View style={styles.buttons_containerVespers}>
            <TouchableOpacity style={this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainer : styles.buttonContainerPressedLeft} onPress={this.OnNormalPressed.bind(this)}>
              <Text style={styles.buttonText}>{"Avui"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainerPressedRight : styles.buttonContainer} onPress={this.OnVespersPressed.bind(this)}>
              <Text style={styles.buttonText}>{"Vespertina"}</Text>
              <View style={{ padding: 1, paddingHorizontal: 5 }}>
                {GlobalData.info_cel.nomCelTom !== '-' ?
                  <View>
                    {GlobalData.info_cel.nomCelTom !== 'dium-pasqua' ?
                      <Text numberOfLines={1} style={styles.redCenter}>{GlobalData.info_cel.nomCelTom}</Text>
                      : null
                    }
                  </View>
                  :
                  <View>
                    {GlobalData.date.getDay() === 6 ?
                      <Text numberOfLines={1} style={styles.redCenter}>{"Missa de Diumenge"}</Text>
                      : null
                    }
                  </View>
                }
              </View>
            </TouchableOpacity>
          </View>
        );
      }
      else {
        return null;
      }
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "VespersSelector", error);
      return null;
    }
  }

  OnNormalPressed() {
    try {
      this.CURRENT_VESPERS_SELECTOR = VESPERS_SELECTOR_TYPES.NORMAL;
      this.setState({ need_lectura2: MassLiturgyData.Lectura2 != '-' })
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "OnNormalPressed", error);
      return null;
    }
  }

  OnVespersPressed() {
    try {
      this.CURRENT_VESPERS_SELECTOR = VESPERS_SELECTOR_TYPES.VESPERS;
      this.setState({ need_lectura2: MassLiturgyData.Lectura2Vespers != '-' })
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "OnVespersPressed", error);
      return null;
    }
  }

  Buttons(need_lectura2) {
    try {
      return (
        <View style={styles.buttons_container}>
          {MassLiturgyData.VetllaPasqua ?
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "VetllaPasquaLecturesSalms", need_lectura2)}>
                <Text style={styles.buttonText}>{"Lectures i salms"}</Text>
              </TouchableOpacity>
              <HR margin_horizontal={20} />
              <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "VetllaPasquaEvangeli", need_lectura2)}>
                <Text style={styles.buttonText}>{"Evangeli"}</Text>
              </TouchableOpacity>
              <HR margin_horizontal={20} />
            </View>
            :
            <View style={{ flex: 1 }}>
              {GlobalData.LT == 'Q_DIUM_RAMS' ?
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "Rams", need_lectura2)}>
                    <Text style={styles.buttonText}>{"Benedicció dels Rams"}</Text>
                  </TouchableOpacity>
                  <HR margin_horizontal={20} />
                </View>
                :
                null}
              <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "1Lect", need_lectura2)}>
                <Text style={styles.buttonText}>{"Primera lectura"}</Text>
              </TouchableOpacity>
              <HR margin_horizontal={20} />
              <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "Salm", need_lectura2)}>
                <Text style={styles.buttonText}>{"Salm"}</Text>
              </TouchableOpacity>
              <HR margin_horizontal={20} />
              {need_lectura2 ?
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "2Lect", need_lectura2)}>
                    <Text style={styles.buttonText}>{"Segona lectura"}</Text>
                  </TouchableOpacity>
                  <HR margin_horizontal={20} />
                </View>
                : null}
              <TouchableOpacity style={styles.buttonContainer} onPress={this.On_Button_Pressed.bind(this, "Evangeli", need_lectura2)}>
                <Text style={styles.buttonText}>{"Evangeli"}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Buttons", error);
      return null;
    }
  }
}

const styles = StyleSheet.create({
  liturgiaContainer: {
    flex: 6,
    marginVertical: 100,
    marginHorizontal: 30,
  },
  liturgiaContainerVespers: {
    height: 90,
    marginHorizontal: 30,
    marginTop: 30,
    marginBottom: -30,
  },
  liturgiaContainer_need_lectura2: {
    flex: 6,
    marginVertical: 70,
    marginHorizontal: 30,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: 'rgb(5, 169, 176)',
    width: null,
    height: null,
  },
  buttons_container: {
    flex: 1,
    opacity: 0.75,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  buttons_containerVespers: {
    flex: 1,
    marginTop: 30,
    opacity: 0.75,
    backgroundColor: 'white',
    borderRadius: 15,
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainerPressedLeft: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(30,30,30,0.15)',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  buttonContainerPressedRight: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(30,30,30,0.15)',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
    fontSize: 20,
    fontWeight: 'normal'
  },
  redCenter: {
    color: '#FF0000',
    fontSize: 15,
    textAlign: 'center'
  },
})
