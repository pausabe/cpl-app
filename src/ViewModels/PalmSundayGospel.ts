// The Gospel of the blessing of the palms, on Palm Sunday, for each year of the cycle.
//
// It is not in the database: the reading screen has always had it written here. The home
// shows its phrase, because the Passion has none (EvangeliCita is "-").
import {YearType} from '../Services/DatabaseEnums';

export interface PalmSundayGospel {
    // "Mt 21,1-11"
    reference: string;
    // "Beneït el qui ve en nom del Senyor"
    phrase: string;
    // "Lectura de l’evangeli segons sant Mateu"
    title: string;
    text: string;
}

const GOSPELS: Record<string, PalmSundayGospel> = {
    [YearType.A]: {
        reference: "Mt 21,1-11",
        phrase: "Beneït el qui ve en nom del Senyor",
        title: "Lectura de l’evangeli segons sant Mateu",
        text: "Quan eren prop de Jerusalem, arribaren a Betfagé, a la muntanya de les Oliveres. Allà Jesús envià dos deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant, i trobareu tot seguit una somera fermada, amb el seu pollí. Deslligueu-la i porteu-me’ls. Si algú us deia res, responeu-li que el Senyor els ha de menester, però els tornarà de seguida».\nTot això va succeir perquè es complís el que el Senyor havia anunciat pel profeta: «Digueu a la ciutat de Sió: Mira, el teu rei fa humilment la seva entrada, muntat en una somera, en un pollí, fill d’un animal de càrrega».\nEls deixebles hi anaren, feren el que Jesús els havia manat, portaren la somera i el pollí, els guarniren amb els seus mantells, i ell hi pujà. Molta gent entapissava el camí amb els seus mantells, altres tallaven branques dels arbres per encatifar el camí i la gent que anava al davant i que el seguia cridava: «Hosanna al Fill de David. Beneït el qui ve en nom del Senyor. Hosanna a dalt del cel».\nQuan hagué entrat a Jerusalem, s’agità tota la ciutat. Molts preguntaven: «Qui és aquest?». La gent que anava amb ell responia: «És el profeta Jesús, de Natzaret de Galilea».",
    },
    [YearType.B]: {
        reference: "Mc 11,1-10",
        phrase: "Beneït el qui ve en nom del Senyor",
        title: "Lectura de l’evangeli segons sant Marc",
        text: "Quan s’acostaven a Jerusalem, vora Betfagé i Betània, cap a la muntanya de les Oliveres, Jesús envià dos dels seus deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant, i així que hi entrareu trobareu un pollí fermat, que ningú no ha muntat encara. Deslligueu-lo i porteu-lo. Si algú us preguntava: Per què ho feu?, digueu-li: el Senyor l’ha de menester, i de seguida el tornarà aquí.»\nElls se n’anaren i trobaren un pollí fermat, fora, al portal d’una casa, i el deslligaren. Alguns dels qui eren allà els deien: «Què feu, que deslligueu el pollí?» Ells respongueren tal com els havia dit Jesús, i els deixaren fer. Porten a Jesús el pollí, el guarneixen amb els seus mantells i ell hi puja.\nMolts estenien els mantells pel camí, i d’altres, ramatge que collien dels camps, i els qui el precedien o el seguien cridaven: «Hosanna. Beneït el qui ve en nom del Senyor. Beneït el Regne del nostre pare David, que està a punt d’arribar. Hosanna a dalt del cel.»",
    },
    [YearType.C]: {
        reference: "Lc 19,28-40",
        phrase: "Beneït el qui ve en nom del Senyor",
        title: "Lectura de l’evangeli segons sant Lluc",
        text: "En aquell temps, Jesús anava al davant pujant a Jerusalem. Quan era a prop de Betfagué i de Betània, a la muntanya de les Oliveres, envià dos dels seus deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant i, entrant, hi trobareu un pollí fermat, que ningú no ha muntat mai. Deslligueu-lo i porteu-lo. Si algú us preguntava per què el deslligueu, respondreu que el Senyor l’ha de menester». Els dos que Jesús enviava se n’anaren i ho trobaren tot tal com Jesús els ho havia dit. Mentre deslligaven el pollí, els amos els digueren: «Per què el deslligueu?». Ells respongueren: «El Senyor l’ha de menester». Portaren el pollí a Jesús, el guarniren tirant-li els mantells a sobre i hi feren pujar Jesús.\nA mesura que Jesús avançava estenien els mantells pel camí. Quan s’acostava a la baixada de la muntanya de les Oliveres, tota la multitud dels seus addictes, plena d’alegria, començà de lloar Déu a grans crits per tots els prodigis que havien vist, i deien: «Beneït sigui el rei, el qui ve en nom del Senyor. Pau al cel, i glòria allà dalt».\nAlguns fariseus que anaven amb la multitud li digueren: «Mestre, renya els teus seguidors». Ell respongué: «Us asseguro que si aquests callessin, cridarien les pedres».",
    },
};

export function palmSundayGospel(yearType: string): PalmSundayGospel | null {
    return GOSPELS[yearType] ?? null;
}
