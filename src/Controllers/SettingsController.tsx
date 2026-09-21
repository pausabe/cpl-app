import React from 'react';
import SettingsScreen from '../Views/Settings/SettingsScreen';
import * as LiturgyStore from './LiturgyStore';

// Configuració: after a setting changes, the day being shown is loaded again with it.
export default function SettingsController() {
    const {database, hours} = LiturgyStore.useLiturgy();
    return (
        <SettingsScreen
            databaseVersion={database.Version}
            precedence={{today: hours.TodayCelebrationInformation?.Precedence, tomorrow: hours.TomorrowCelebrationInformation?.Precedence}}
            onSettingsChanged={() => LiturgyStore.reload(LiturgyStore.currentDate())}/>
    );
}
