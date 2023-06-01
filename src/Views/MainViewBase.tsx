import {
    StyleSheet,
    SafeAreaView,
    ImageBackground
} from 'react-native';
import GlobalKeys from '../Utils/GlobalKeys';

export default class MainViewBase{
    static BaseContainer(viewInsideContainer){
        return(
            <SafeAreaView style={{flex: 1, backgroundColor: GlobalKeys.screensBackgroundColor}}>
                {
                    <ImageBackground source={require('../Assets/img/bg/home_background.jpg')}
                                        style={styles.backgroundImage} blurRadius={5}>
                        {viewInsideContainer}
                    </ImageBackground>
                }
            </SafeAreaView>     
        );
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        backgroundColor: 'rgb(5, 169, 176)',
        width: null,
        height: null,
    },
})
