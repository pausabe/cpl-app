import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter'
import HR from '../../Components/HRComponent';
import GLOBALS from '../../Globals/Globals';

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

      console.log("[DEBUG] Refresh_Layout ", LD_VALUES.VetllaPasqua);

      this.CURRENT_VESPERS_SELECTOR = (!LD_VALUES.VetllaPasqua && LD_VALUES.Vespers && G_VALUES.date.getHours() >= GLOBALS.afternoon_hour && LD_VALUES.Lectura2Vespers != '-')? VESPERS_SELECTOR_TYPES.VESPERS : VESPERS_SELECTOR_TYPES.NORMAL;

      this.setState({
        need_lectura2: (this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.NORMAL && LD_VALUES.Lectura2 != '-') || (this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS && LD_VALUES.Lectura2Vespers != '-')
      });
  
    } catch (error) {
      console.log("[Exception] ", error);
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
    console.log("emitShare");
  }

  //RENDER -------------------------------------------------------------------------------
  render() {
    console.log("RENDER LDScreen");
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
               <ImageBackground source={require('../../Globals/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
               {LD_VALUES.Vespers == undefined ?
                 null :
                 <View style={{ flex: 1, }}>
                   {LD_VALUES.Vespers ?
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
      console.log("[DEBUG] catch. error: ", error)
      return null
    }
  }

  VespersSelector() {
    try {
      if (LD_VALUES.Vespers) {
        return (
          <View style={styles.buttons_containerVespers}>
            <TouchableOpacity style={this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainer : styles.buttonContainerPressedLeft} onPress={this.OnNormalPressed.bind(this)}>
              <Text style={styles.buttonText}>{"Avui"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={this.CURRENT_VESPERS_SELECTOR == VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainerPressedRight : styles.buttonContainer} onPress={this.OnVespersPressed.bind(this)}>
              <Text style={styles.buttonText}>{"Vespertina"}</Text>
              <View style={{ padding: 1, paddingHorizontal: 5 }}>
                {G_VALUES.info_cel.nomCelTom !== '-' ?
                  <View>
                    {G_VALUES.info_cel.nomCelTom !== 'dium-pasqua' ?
                      <Text numberOfLines={1} style={styles.redCenter}>{G_VALUES.info_cel.nomCelTom}</Text>
                      : null
                    }
                  </View>
                  :
                  <View>
                    {G_VALUES.date.getDay() === 6 ?
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
      console.log("Error: ", error);
      return null;
    }
  }

  OnNormalPressed() {
    try {
      this.CURRENT_VESPERS_SELECTOR = VESPERS_SELECTOR_TYPES.NORMAL;
      this.setState({ need_lectura2: LD_VALUES.Lectura2 != '-' })
    }
    catch (error) {
      console.log("Error: ", error);
      return null;
    }
  }

  OnVespersPressed() {
    try {
      this.CURRENT_VESPERS_SELECTOR = VESPERS_SELECTOR_TYPES.VESPERS;
      this.setState({ need_lectura2: LD_VALUES.Lectura2Vespers != '-' })
    }
    catch (error) {
      console.log("Error: ", error);
      return null;
    }
  }

  Buttons(need_lectura2) {
    try {
      return (
        <View style={styles.buttons_container}>
          {LD_VALUES.VetllaPasqua ?
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
              {G_VALUES.LT == 'Q_DIUM_RAMS' ?
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
      console.log("Error: ", error);
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
