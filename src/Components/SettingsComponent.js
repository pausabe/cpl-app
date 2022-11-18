import React, {Component} from 'react';
import {View, Text, Switch, StyleSheet, Platform} from 'react-native';
import {Picker as SelectPicker} from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import HR from './HRComponent';
import GlobalKeys from "../Utils/GlobalKeys";

export default class SettingsComponent extends Component {

    constructor(props) {
        super();
        this.name = props.name;
        this.description = props.description;
        this.id = props.id;
        this.value = props.value;
        this.options = props.options;
        this.callback = props.callback;
        this.selectorComponent = props.selectorComponent;
        this.selectorProps = props.selectorProps;
    }

    UNSAFE_componentWillMount() {
        this.setState({
            value: this.value,
            Aa: this.convertTextSize(this.value),
        });
    }

    render() {
        let selectorComponent;
        let styleSelectorView = styles.selectorView;
        switch (this.props.selectorComponent) {
            case "switch":
                styleSelectorView = styles.selectorViewSwitch;
                selectorComponent = this._generateSwitch();
                break;
            case "slider":
                styleSelectorView = styles.selectorViewSlider;
                selectorComponent = this._generateSlider();
                break;
            case "picker":
                selectorComponent = this._generatePicker();
                break;
            default:
        }

        return (
            <View>
                <View style={styles.option}>
                    <View style={styles.textView}>
                        <Text style={styles.text}>{this.name}</Text>
                    </View>
                    <View style={styleSelectorView}>
                        {selectorComponent}
                    </View>
                </View>
                <HR/>
            </View>
        );
    }

    _generateSwitch() {
        let selectorProps = this._mergeProps({
            value: !!this.state.value,
            trackColor: {true: GlobalKeys.switchColor},
            onValueChange: this._updateSelectionStateCallback.bind(this),
        });
        return React.createElement(Switch, selectorProps);
    }

    _generateSlider() {
        let selectorProps = this._mergeProps({
            value: this.state.value,
            minimumTrackTintColor: GlobalKeys.switchColor,
            onSlidingComplete: this._selectionCallback.bind(this)
        });
        return (
            <View style={{flex: 1, flexDirection: 'row',}}>
                <View style={{flex: 3, paddingRight: 10, justifyContent: 'center'}}>
                    {React.createElement(Slider, selectorProps)}
                </View>
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Text style={{
                        textAlign: 'center',
                        color: 'black',
                        fontSize: this.state.Aa,
                        fontWeight: '300'
                    }}>
                        {'Aa'}
                    </Text>
                </View>
            </View>
        );
    }

    _generatePicker() {
        if (Platform.OS === 'ios') {
            let selectorProps = this._mergeProps({
                selectedValue: this.state.value,
                onValueChange: this._updateSelectionStateCallback.bind(this)
            });
            return React.createElement(SelectPicker, selectorProps,
                this._generatePickerOptions()
            );
        } else {
            let selectorProps = this._mergeProps({
                selectedValue: this.state.value,
                onValueChange: this._updateSelectionStateCallback.bind(this),
                style: styles.selectorPicker
            });
            return React.createElement(SelectPicker, selectorProps,
                this._generatePickerOptions()
            );
        }
    }

    _generatePickerOptions() {
        let options = [];
        for (let key in this.options) {
            options.push(
                <SelectPicker.Item label={this.options[key]} value={key} key={key}/>
            );
        }
        return options;
    }

    _updateSelectionStateCallback(value) {
        this.setState({
            value: value
        });
        this._selectionCallback(value);
    }

    _selectionCallback(value) {
        const textSize = this.convertTextSize(Math.trunc(value));
        this.setState({
            Aa: textSize,
        });
        this.callback(this.id, value);
    }

    convertTextSize(value) {
        switch (value) {
            case 1:
                return GlobalKeys.size1;
            case 2:
                return GlobalKeys.size2;
            case 3:
                return GlobalKeys.size3;
            case 4:
                return GlobalKeys.size4;
            case 5:
                return GlobalKeys.size5;
            case 6:
                return GlobalKeys.size6;
            case 7:
                return GlobalKeys.size7;
            case 8:
                return GlobalKeys.size8;
            case 9:
                return GlobalKeys.size9;
            case 10:
                return GlobalKeys.size10;
        }
    }

    _mergeProps(properties) {
        return Object.assign(this.selectorProps ? this.selectorProps : {}, properties);
    }

}

const styles = StyleSheet.create({
    option: {
        minHeight: 70,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    textView: {
        flex: 3,
        paddingRight: 15,
        justifyContent: "center"
    },
    selectorView: {
        flex: 5,
        justifyContent: "center"
    },
    text: {
        color: "black",
        fontSize: 16
    },
    selectorViewSwitch: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    selectorViewSlider: {
        flex: 7,
        justifyContent: "center"
    },
    selectorPicker: {
        color: "gray"
    },
});
