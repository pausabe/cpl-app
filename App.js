import {useCustomUpdater} from "./src/Services/UpdaterService";
import NavigationController from "./src/Controllers/NavigationController";

function ConfigureUpdates() {
    useCustomUpdater();
}

export default function App() {
    ConfigureUpdates();
    return (
        <NavigationController />
    );
}
