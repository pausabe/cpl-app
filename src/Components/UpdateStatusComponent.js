import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as Updates from 'expo-updates';

// State of the OTA updates, with the versions at the bottom of Settings: whether one is being
// downloaded, or is already downloaded and only waits for the app to restart.
export default function UpdateStatusComponent() {
    const updates = Updates.useUpdates();

    if (!Updates.isEnabled) {
        return <Text style={styles.text}>{"Actualitzacions: desactivades en desenvolupament"}</Text>;
    }

    return (
        <View>
            <Text style={styles.text}>{"Actualització en ús: "}{RunningUpdateText(updates.currentlyRunning)}</Text>
            <Text style={styles.text}>{StatusText(updates)}</Text>
        </View>
    );
}

function RunningUpdateText(currentlyRunning) {
    if (currentlyRunning.isEmbeddedLaunch || !currentlyRunning.createdAt) {
        return "la de la botiga";
    }
    return `${DateText(currentlyRunning.createdAt)} ${TimeText(currentlyRunning.createdAt)}`;
}

function StatusText(updates) {
    if (updates.isDownloading) {
        const percentage = Math.round((updates.downloadProgress ?? 0) * 100);
        return "S'està baixant una actualització…" + (percentage > 0 ? ` ${percentage}%` : "");
    }
    if (updates.isUpdatePending) {
        return "Hi ha una actualització a punt. S'aplicarà quan tornis a obrir l'aplicació.";
    }
    if (updates.isChecking) {
        return "S'està comprovant si hi ha actualitzacions…";
    }
    if (updates.downloadError) {
        return "No s'ha pogut baixar l'actualització. Es tornarà a provar més tard.";
    }
    if (updates.checkError) {
        return "No s'ha pogut comprovar si hi ha actualitzacions.";
    }
    if (updates.lastCheckForUpdateTimeSinceRestart) {
        return `L'aplicació està al dia (comprovat a les ${TimeText(updates.lastCheckForUpdateTimeSinceRestart)})`;
    }
    return "Encara no s'ha comprovat si hi ha actualitzacions.";
}

function DateText(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function TimeText(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        color: 'grey',
        fontSize: 11
    },
});
