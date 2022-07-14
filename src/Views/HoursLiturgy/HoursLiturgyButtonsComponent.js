import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import HR from '../../Components/HRComponent';
import {CurrentHoursLiturgy, CurrentLiturgyDayInformation} from "../../Services/DataService";
import {StringManagement} from "../../Utils/StringManagement";
import {SpecificLiturgyTimeType} from "../../Services/CelebrationTimeEnums";

export default class HoursLiturgyButtonsComponent extends Component {
  render() {
    const nowDate = new Date();
    const hour = nowDate.getHours();

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.buttonContainer} onPress={this.props.oficiCB}>
          <Text style={styles.buttonText}>{"Ofici de lectura"}</Text>
        </TouchableOpacity>
        <HR margin_horizontal={20} />
        <TouchableOpacity style={styles.buttonContainer} onPress={this.props.laudesCB}>
          {hour > 5 && hour < 9 ?
            <Text style={styles.buttonTextBold}>{"Laudes"}</Text>
            :
            <Text style={styles.buttonText}>{"Laudes"}</Text>
          }
        </TouchableOpacity>
        <HR margin_horizontal={20} />
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ flex: 1, paddingTop: 5 }}>
            <Text style={styles.buttonText}>{"Hora menor"}</Text>
          </View>
          <View style={{ flex: 2, flexDirection: 'row' }}>
            <TouchableOpacity style={styles.buttonContainer} onPress={this.props.terciaCB}>
              {hour > 8 && hour < 12 ?
                <Text style={styles.horaMenorTextBold}>{"Tèrcia"}</Text>
                :
                <Text style={styles.horaMenorText}>{"Tèrcia"}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={this.props.sextaCB}>
              {hour > 11 && hour < 15 ?
                <Text style={styles.horaMenorTextBold}>{"Sexta"}</Text>
                :
                <Text style={styles.horaMenorText}>{"Sexta"}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={this.props.nonaCB}>
              {hour > 14 && hour < 18 ?
                <Text style={styles.horaMenorTextBold}>{"Nona"}</Text>
                :
                <Text style={styles.horaMenorText}>{"Nona"}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
        <HR margin_horizontal={20} />
        <TouchableOpacity style={styles.buttonContainer} onPress={this.props.vespresCB}>
          {hour > 17 && hour <= 23 ?
            <Text style={styles.buttonTextBold}>{"Vespres"}</Text>
            :
            <Text style={styles.buttonText}>{"Vespres"}</Text>
          }
          {StringManagement.HasLiturgyContent(CurrentHoursLiturgy.Vespers.Title)
            && CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_DIUM_PASQUA ?
            <View style={{ padding: 5, paddingHorizontal: 15 }}>
              <Text numberOfLines={1} style={styles.redCenter}>{CurrentHoursLiturgy.Vespers.Title}</Text>
            </View>
            : null}
        </TouchableOpacity>
        <HR margin_horizontal={20} />
        <TouchableOpacity style={styles.buttonContainer} onPress={this.props.completesCB}>
          {hour >= 0 && hour < 2 ?
            <Text style={styles.buttonTextBold}>{"Completes"}</Text>
            :
            <Text style={styles.buttonText}>{"Completes"}</Text>
          }
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    opacity: 0.75,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'normal'
  },
  buttonTextBold: {
    textAlign: 'center',
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  horaMenorText: {
    textAlign: 'center',
    color: '#595959',
    fontSize: 17,
    fontWeight: 'normal'
  },
  horaMenorTextBold: {
    textAlign: 'center',
    color: '#595959',
    fontSize: 17,
    fontWeight: 'bold'
  },
  redCenter: {
    color: '#FF0000',
    fontSize: 15,
    textAlign: 'center'
  },
})
