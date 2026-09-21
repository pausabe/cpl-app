import {useCustomUpdater} from "./src/Services/UpdaterService";
import NavigationController from "./src/Controllers/NavigationController";
import {useAppFonts} from "./src/Theme/fonts";

function ConfigureUpdates() {
    useCustomUpdater();
}

export default function App() {
    ConfigureUpdates();
    // Literata before the first screen, so that the day card never shows up in another font
    const fontsReady = useAppFonts();
    if (!fontsReady) {
        return null;
    }
    return (
        <NavigationController />
    );
}
