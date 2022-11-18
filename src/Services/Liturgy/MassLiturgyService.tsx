import SoulKeys from '../SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import MassLiturgy, {DayMassLiturgy, MassGospel} from "../../Models/MassLiturgy";
import LiturgyDayInformation, {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import {Settings} from "../../Models/Settings";
import {CelebrationType, YearType} from "../DatabaseEnums";
import {StringManagement} from "../../Utils/StringManagement";
import * as PrecedenceService from "../PrecedenceService";
import CelebrationInformation from "../../Models/HoursLiturgy/CelebrationInformation";
import * as CelebrationIdentifierService from "../CelebrationIdentifierService";

export async function ObtainMassLiturgy(liturgyDayInformation: LiturgyDayInformation, celebrationInformation: CelebrationInformation, settings: Settings): Promise<MassLiturgy> {
    if (liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_DIUM_PASQUA) {
        return GetEasterEve(liturgyDayInformation.Today);
    }
    let massLiturgy = new MassLiturgy();
    massLiturgy.Today = await GetMassLiturgy(liturgyDayInformation.Today, settings);
    massLiturgy.HasVespers = DecideIfHasVespers(liturgyDayInformation, celebrationInformation);
    massLiturgy.Vespers = massLiturgy.HasVespers? await GetVespersMassLiturgy(liturgyDayInformation.Tomorrow, settings) : undefined;
    return massLiturgy;
}

function DecideIfHasVespers(liturgyDayInformation: LiturgyDayInformation, celebrationInformation: CelebrationInformation): boolean{
    const todayShouldHaveVespers = liturgyDayInformation.Tomorrow.Date.getDay() === 0 ||
        liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity;
    const tomorrowIsMoreImportantThanToday =
        PrecedenceService.ObtainPrecedenceByLiturgyTime(liturgyDayInformation.Today, celebrationInformation) >
        PrecedenceService.ObtainPrecedenceByLiturgyTime(liturgyDayInformation.Tomorrow, celebrationInformation);
    return todayShouldHaveVespers && 
        tomorrowIsMoreImportantThanToday && 
        liturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.Q_DIUM_PASQUA;
}

async function GetMassLiturgy(liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Promise<DayMassLiturgy> {
    const celebrationIdentifier = GetCelebrationIdentifier(liturgyDayInformation, settings);
    if (IsCelebrationDay(liturgyDayInformation, celebrationIdentifier)) {
        return GetCelebrationDayLiturgy(liturgyDayInformation, celebrationIdentifier, settings);
    }
    else {
        return await DatabaseDataService.GetNormalDaysMassLiturgy(liturgyDayInformation);
    }
}

function GetCelebrationIdentifier(liturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): number {
    let celebrationVariableIdentifier = GetCelebrationVariableIdentifier(liturgyDayInformation);
    if(celebrationVariableIdentifier !== -1){
        return celebrationVariableIdentifier;
    }
    if(settings.OptionalFestivityEnabled &&
        (liturgyDayInformation.CelebrationType === CelebrationType.OptionalMemory ||
        liturgyDayInformation.CelebrationType === CelebrationType.OptionalVirginMemory)) {
        return GetSpecialOptionalDayIdentifier(liturgyDayInformation.Date)
    }
    return -1;
}

function IsCelebrationDay(liturgyDayInformation: LiturgySpecificDayInformation, celebrationIdentifier: number){
    return liturgyDayInformation.CelebrationType === CelebrationType.Memory ||
        liturgyDayInformation.CelebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.CelebrationType === CelebrationType.Festivity ||
        IsSpecialChristmas(liturgyDayInformation) ||
        celebrationIdentifier !== -1;
}

async function GetCelebrationDayLiturgy(liturgyDayInformation: LiturgySpecificDayInformation, celebrationIdentifier: number, settings: Settings): Promise<DayMassLiturgy>{
    return MergeLiturgyDays(
        await DatabaseDataService.GetHolyDaysMass(celebrationIdentifier, liturgyDayInformation, settings),
        await DatabaseDataService.GetNormalDaysMassLiturgy(liturgyDayInformation));
}

function MergeLiturgyDays(firstLiturgyDay: DayMassLiturgy, secondLiturgyDay: DayMassLiturgy): DayMassLiturgy {
    const firstLiturgyDayHasContent = firstLiturgyDay && StringManagement.HasLiturgyContent(firstLiturgyDay.Gospel.Gospel);
    const secondLiturgyDayHasContent = secondLiturgyDay && StringManagement.HasLiturgyContent(secondLiturgyDay.Gospel.Gospel);
    if(!firstLiturgyDayHasContent){
        return secondLiturgyDay;
    }
    if(!secondLiturgyDayHasContent){
        return firstLiturgyDay;
    }
    let dayMassLiturgy = firstLiturgyDay;
    if (!StringManagement.HasLiturgyContent(dayMassLiturgy.FirstReading.Reading)) {
        dayMassLiturgy.FirstReading = secondLiturgyDay.FirstReading
    }
    if (!StringManagement.HasLiturgyContent(dayMassLiturgy.Psalm.Psalm)) {
        dayMassLiturgy.Psalm = secondLiturgyDay.Psalm;
    }
    if (!StringManagement.HasLiturgyContent(dayMassLiturgy.SecondReading.Reading)) {
        dayMassLiturgy.SecondReading = secondLiturgyDay.SecondReading;
    }
    if(!StringManagement.HasLiturgyContent(dayMassLiturgy.Hallelujah.Hallelujah)){
        dayMassLiturgy.Hallelujah = secondLiturgyDay.Hallelujah;
    }
    if (!StringManagement.HasLiturgyContent(dayMassLiturgy.Gospel.Gospel)) {
        dayMassLiturgy.Gospel = secondLiturgyDay.Gospel;
    }
    return dayMassLiturgy;
}

async function GetVespersMassLiturgy(tomorrowLiturgyDayInformation: LiturgySpecificDayInformation, settings: Settings): Promise<DayMassLiturgy>{
    const holyDayMassIdentifier = GetSpecialVespersIdentifier(tomorrowLiturgyDayInformation);
    if (holyDayMassIdentifier === -1) {
        return await GetMassLiturgy(tomorrowLiturgyDayInformation, settings);
    }
    else {
        return await DatabaseDataService.GetHolyDaysMassWithIdentifier(holyDayMassIdentifier);
    }
}

function IsSpecialChristmas(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean{
    if(liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.O_ORDINARI)
        return false;
    if(liturgySpecificDayInformation.Date.getMonth() === 11){
        return liturgySpecificDayInformation.Date.getDate() === 17 ||
            liturgySpecificDayInformation.Date.getDate() === 18 ||
            liturgySpecificDayInformation.Date.getDate() === 19 ||
            liturgySpecificDayInformation.Date.getDate() === 20 ||
            liturgySpecificDayInformation.Date.getDate() === 21 ||
            liturgySpecificDayInformation.Date.getDate() === 22 ||
            liturgySpecificDayInformation.Date.getDate() === 23 ||
            liturgySpecificDayInformation.Date.getDate() === 24 ||
            liturgySpecificDayInformation.Date.getDate() === 29 ||
            liturgySpecificDayInformation.Date.getDate() === 30 ||
            liturgySpecificDayInformation.Date.getDate() === 31;
    }
    else if(liturgySpecificDayInformation.Date.getMonth() === 0){
        return liturgySpecificDayInformation.Date.getDate() === 2 ||
            liturgySpecificDayInformation.Date.getDate() === 3 ||
            liturgySpecificDayInformation.Date.getDate() === 4 ||
            liturgySpecificDayInformation.Date.getDate() === 5 ||
            liturgySpecificDayInformation.Date.getDate() === 7 ||
            liturgySpecificDayInformation.Date.getDate() === 8 ||
            liturgySpecificDayInformation.Date.getDate() === 9 ||
            liturgySpecificDayInformation.Date.getDate() === 10 ||
            liturgySpecificDayInformation.Date.getDate() === 11 ||
            liturgySpecificDayInformation.Date.getDate() === 12;
    }
    return false;
}

function GetEasterEve(liturgySpecificDayInformation: LiturgySpecificDayInformation): MassLiturgy {
    let massLiturgy = new MassLiturgy();

    massLiturgy.Today.FirstReading.Quote = "Gn 1,1–2,2";
    massLiturgy.Today.FirstReading.Comment = "Déu veié tot el que havia fet, i era bo de debò";
    massLiturgy.Today.FirstReading.Title = "Lectura del llibre del Gènesi";
    massLiturgy.Today.FirstReading.Reading = "Al principi Déu creà el cel i la terra. La terra era un món buit i sense cap ordre, tota la superfície de l’oceà era coberta de foscor i un vent de Déu batia les ales sobre les aigües. Déu digué: «Que existeixi la llum». I la llum existí. Déu veié que la llum era bona de debò. Déu la separà de la foscor i donà a la llum el nom de «dia», i a la foscor, el de «nit». Hi hagué un vespre i un matí, i fou el primer dia.\nDéu digué: «Que hi hagi un firmament entremig de les aigües per separar unes aigües de les altres». I va ser així. Déu va fer el firmament i separà les aigües que hi ha sota de les de sobre el firmament. Déu veié que el firmament era bo, i li donà el nom de «cel». Hi hagué un vespre i un matí, i fou el segon dia. Déu digué: «Que les aigües de sota el cel es reuneixin totes en un indret i apareguin els continents». I va ser així. I Déu donà als continents el nom de «terra», i a les aigües, el de «mar». Déu ho veié, i era bo.\nDéu digué: «Que la terra produeixi la vegetació: herbes que facin llavor i arbres fruiters de tota mena que donin fruit amb la seva llavor per tota la terra». I va ser així. La terra produí la vegetació, les herbes de tota mena que fan la seva llavor i els arbres de tota mena que donen fruit amb la seva llavor. Déu ho veié i era bo. Hi hagué un vespre i un matí, i fou el tercer dia.\nDéu digué: «Que hi hagi al firmament del cel uns llumeners que separin el dia de la nit, i assenyalin les festivitats, els dies i els anys i, des del firmament del cel, il·luminin la terra». I va ser així. Déu va fer els dos astres gegants: un de més gran que regnés sobre el dia, i un de més petit que governés la nit; va fer també les estrelles. Déu els col·locà al firmament del cel perquè il·luminessin la terra, regnessin sobre el dia i la nit i separessin la llum de la foscor. Déu ho veié i era bo. Hi hagué un vespre i un matí, i fou el quart dia.\nDéu digué: «Que les aigües produeixin éssers vius que hi nedin, i animals alats que volin sobre la terra, ran del firmament del cel». I va ser així. Déu creà els grans monstres marins, éssers vius de tota mena que neden dins de l’aigua i totes les menes de bestioles alades. Déu ho veié, i era bo. Llavors Déu els beneí dient-los: «Sigueu fecunds, multipliqueu-vos i ompliu les aigües dels mars, i que els ocells i les bestioles alades es multipliquin a la terra». Hi hagué un vespre i un matí, i fou el cinquè dia. Déu digué: «Que la terra produeixi éssers vius de tota mena: bestioles i tota mena d’animals domèstics i feréstecs». I va ser així. Déu va fer tota mena d’animals feréstecs i domèstics i tota mena de cucs i bestioles. Déu ho veié, i era bo.\nDéu digué també: «Fem l’home a imatge nostra, semblant a nosaltres, i que tingui sotmesos els peixos del mar, els ocells i els animals domèstics i feréstecs i totes les bestioles que s’arrosseguen per terra». Déu creà l’home a la seva imatge, el creà a imatge de Déu; creà l’home i la dona. Déu els beneí dient-los: «Sigueu fecunds, multipliqueu-vos, ompliu la terra i domineu-la; tingueu sotmesos els peixos del mar, els ocells del cel i tots els animals que s’arrosseguen per terra». Déu digué encara: «Us dono totes les herbes que granen per tota la terra, i tots els arbres que donen fruit amb la seva llavor; seran el vostre aliment. I a tots els animals feréstecs, a tots els ocells del cel i a totes les bestioles que s’arrosseguen per terra, a tots els éssers vius, els dono l’herba verda per aliment». I va ser així. Déu veié tot el que havia fet, i era bo de debò. Hi hagué un vespre i un matí, i fou el sisè dia.\nAixí quedaren acabats el cel i la terra amb tots els estols que s’hi mouen. Déu acabà la seva obra al sisè dia, i al dia setè reposà de tota l’obra que havia fet.";
    massLiturgy.Today.Psalm.Quote = "103,1-2a.5-6.10 i 12.13-14.24 i 35c (R.: 30)";
    massLiturgy.Today.Psalm.Psalm = "Beneeix el Senyor, ànima meva.\nSenyor, Déu meu, que en sou de gran.\nAneu vestit d’esplendor i de majestat,\nus embolcalla la llum com un mantell.\n\nR. Quan envieu el vostre alè, reneix la creació,\ni renoveu la vida sobre la terra.\n\nAssentàreu la terra sobre uns fonaments,\nincommovible per segles i segles.\nLa cobríreu amb el mantell dels oceans,\nles aigües sepultaven les muntanyes. R.\n\nDe les fonts, en feu brollar torrents,\nque s’escolen entre les muntanyes;\na les seves ribes nien els ocells,\nrefilen entre les branques. R.\n\nDes del vostre palau regueu les muntanyes,\nsacieu la terra de pluges del cel;\nfeu néixer l’herba per al bestiar\nque treballa al servei de l’home. R.\n\nQue en són de variades, Senyor, les vostres obres,\ni totes les heu fetes amb saviesa.\nLa terra és plena de les vostres criatures.\nBeneeix el Senyor, ànima meva. R.";

    massLiturgy.Today.SecondReading.Quote = "Gn 22,1-13.15-18";
    massLiturgy.Today.SecondReading.Comment = "Sacrifici d’Abraham, el nostre pare en la fe";
    massLiturgy.Today.SecondReading.Title = "Lectura del llibre del Gènesi";
    massLiturgy.Today.SecondReading.Reading = `En aquells dies, Déu, per posar a prova Abraham, el cridà: «Abraham». Ell respongué: «Aquí em teniu». Déu li digué: «Pren, si et plau, Isaac, el teu fill únic, que tant estimes, ves-te’n al país de Morià, i allà, dalt de la muntanya que jo t’indicaré, sacrifica’l en holocaust».\nAbraham es llevà de bon matí, guarní l’ase, prengué dos mossos i el seu fill Isaac, estellà la llenya per al foc de l’holocaust i es posà en camí cap a l’indret que Déu li havia dit. Al tercer dia Abraham alçà els ulls i veié de lluny l’indret. Llavors digué als mossos: «Quedeu-vos aquí amb l’ase; jo i el noi ens arribarem allà, i tornarem quan haurem adorat». Abraham carregà la llenya de l’holocaust a les espatlles del seu fill Isaac, i ell portava el foc i el ganivet. I començaren tots dos a caminar. Isaac digué a Abraham el seu pare: «Escolta, pare». Abraham respongué: «Què vols, fill meu?». Li diu Isaac: «Tenim el foc i la llenya per a l’holocaust, però, l’anyell on és?». Abraham li respon: «Déu mateix es proveirà d’anyell per a l’holocaust, fill meu». I continuaren caminant tots dos.\nArribats a l’indret que Déu havia indicat a Abraham, hi aixecà l’altar, apilà la llenya, lligà el seu fill, Isaac, i el posà a l’altar, sobre la llenya.\nLlavors Abraham agafà el ganivet per degollar el seu fill. Però l’àngel del Senyor el cridà des del cel: «Abraham, Abraham». Ell li respongué: «Aquí em teniu». L’àngel li digué: «Deixa estar el noi, no li facis res. Ja veig que reverencies Déu, tu que no m’has refusat el teu fill únic». Llavors Abraham alçà els ulls i veié un moltó agafat per les banyes a una bardissa. Hi anà, el prengué i el sacrificà en holocaust en lloc del seu fill. A aquell indret, Abraham li donà el nom de «El-Senyor-es-proveeix». Per això, encara avui, la gent diu: «A la muntanya el Senyor es proveeix». L’àngel del Senyor tornà a cridar Abraham des del cel i li digué: «Escolta l’oracle del Senyor: "Ja que has fet això de no refusar - me el teu fill únic, juro per mi mateix que t’ompliré de benediccions i faré que la teva descendència sigui tan nombrosa com les estrelles del cel i com els grans de sorra de les platges de la mar; els teus descendents heretaran les ciutats dels seus enemics, i tots els nadius del país, per beneir - se, es valdran de la teva descendència, perquè has obeït el que jo t’havia manat"».`;
    massLiturgy.Today.SecondPsalm.Quote = "15,5 i 8.9-10.11 (R.: 1)";
    massLiturgy.Today.SecondPsalm.Psalm = "Senyor, heretat meva i calze meu,\nvós m’heu triat la possessió.\nSempre tinc present el Senyor;\namb ell a la dreta, mai no cauré.\n\nR. Guardeu-me, Déu meu, en vós trobo refugi.\n\nEl meu cor se n’alegra i en faig festa tot jo,\nfins el meu cos reposa confiat:\nno abandonareu la meva vida enmig dels morts,\nni deixareu caure a la fossa el qui us estima. R.\n\nM’ensenyareu el camí que duu a la vida:\njoia i festa a desdir a la vostra presència;\nal costat vostre, delícies per sempre. R.";

    massLiturgy.Today.ThirdReading.Quote = "Ex 14,15–15,1a";
    massLiturgy.Today.ThirdReading.Comment = "Els israelites caminaren per terra eixuta enmig del mar";
    massLiturgy.Today.ThirdReading.Title = "Lectura del llibre de l’Èxode";
    massLiturgy.Today.ThirdReading.Reading = "En aquells dies, el Senyor digué a Moisès: «Per què aquests crits d’auxili? Ordena als israelites que es posin en marxa, i tu alça la vara, estén la mà cap al mar i es partirà en dos perquè els israelites caminin per terra eixuta, enmig del mar. Jo faré que els egipcis s’obstinin a penetrar-hi darrere d’ells. I mostraré el meu poder sobre el Faraó i sobre tot el seu exèrcit, sobre els seus carros de guerra i els seus soldats. I Egipte sabrà que soc el Senyor, quan la meva glòria s’haurà manifestat en el Faraó, en els seus carros i en els seus soldats». L’àngel de Déu que caminava davant la formació d’Israel es posà a caminar al seu darrere, i també la columna que tenien al davant es posà al darrere i se situà entre la formació dels egipcis i la d’Israel. Hi havia el núvol i la fosca, però el núvol il·luminà la nit. En tota la nit les dues formacions no s’acostaren l’una a l’altra. Moisès estengué la mà cap al mar, i el Senyor, amb un vent fortíssim de llevant, que durà tota la nit, va fer retirar la mar i la convertí en terra eixuta. Les aigües es partiren i els israelites entraren caminant per terra eixuta enmig del mar, amb l’aigua com una muralla a dreta i esquerra. Els egipcis intentaren perseguir-los, i tota la cavalleria del Faraó, amb els carros i els guerrers, entraren darrera d’ells en el llit de la mar.\nA la matinada, el Senyor, des de la columna de foc i de núvol, posà la mirada sobre la formació dels egipcis i hi sembrà la confusió: encallà les rodes dels carros i feia que les tropes avancessin a pas feixuc. Els egipcis digueren: «Fugim del combat! El Senyor lluita a favor d’Israel contra els egipcis». Llavors el Senyor digué a Moisès: «Estén la mà cap al mar: que se’n tornin les aigües i cobreixin els egipcis, els seus carros i els guerrers». Moisès estengué la mà cap al mar, i de bon matí, quan el mar se’n tornava al seu lloc de sempre, es trobà amb els egipcis que fugien, i el Senyor precipità els egipcis al mig del mar. Les aigües que se’n tornaven cobriren els carros amb els seus guerrers. De totes les tropes del Faraó que havien penetrat darrere els israelites en el llit de la mar no en quedà ni un sol home. Però els israelites havien caminat per terra eixuta enmig del mar, amb l’aigua com una muralla a dreta i esquerra.\nAquell dia el Senyor salvà Israel de les mans dels egipcis i els israelites veieren els egipcis morts a la platja. Quan els israelites veieren la gran gesta que el Senyor havia obrat contra Egipte, tot el poble sentí un gran respecte pel Senyor i cregueren en ell i en el seu servent Moisès. Llavors Moisès i els israelites entonaren aquest càntic en honor del Senyor.\n\n[Després d’aquesta lectura no es diu «Paraula de Déu»]";
    massLiturgy.Today.ThirdPsalm.Quote = "Ex 15,1-2.3-4.5-6.17-18 (R.: 1a)";
    massLiturgy.Today.ThirdPsalm.Psalm = "Cantem al Senyor per la seva gran victòria,\nha tirat al mar cavalls i cavallers.\nDel Senyor em ve la glòria i el triomf,\nés ell qui m’ha salvat. És el meu Déu, i jo l’he de lloar;\nés el Déu del meu pare, i jo l’he d’enaltir!\n\nR. Cantem al Senyor per la seva gran victòria.\n\nEl Senyor és un gran guerrer,\nel seu nom és el Senyor!\nHa tirat al mar els carros del Faraó,\nels millors combatents s’han enfonsat al mar Roig. R.\n\nEls han cobert les onades\ni han baixat al fons com un roc.\nLa vostra dreta, Senyor, té un poder magnífic,\nla vostra dreta, Senyor, ha desfet l’enemic. R.\n\nFeu entrar el vostre poble a la muntanya,\nplanteu-lo a la vostra heretat,\nal lloc on heu posat el vostre tron,\nal santuari que han construït les vostres mans.\nEl Senyor serà rei per sempre més! R.";

    massLiturgy.Today.FourthReading.Quote = "Is 54,5-14";
    massLiturgy.Today.FourthReading.Comment = "El Senyor que t’ha reclamat t’estima amb un amor etern";
    massLiturgy.Today.FourthReading.Title = "Lectura del llibre d’Isaïes";
    massLiturgy.Today.FourthReading.Reading = "El teu creador s’ha fet el teu marit, el seu nom és El-Senyor-de-l’univers; t’ha rehabilitat el Sant d’Israel, anomenat Déu-de-tota-la-terra. El Senyor t’ha cridat com qui crida l’esposa abandonada que s’enyora. Pot ser repudiada l’esposa de la joventut?, diu el teu Déu. Jo t’havia abandonat per poca estona, però ara et recobro amb un afecte immens. En una flamarada d’indignació t’havia amagat un moment la meva mirada, però ara t’estimo amb un amor etern, diu el Senyor, el qui t’ha reclamat. Faré com vaig fer en els dies de Noè: Llavors vaig jurar que l’aiguat de Noè no inundaria mai més la terra; ara juro que no m’irritaré ni t’amenaçaré mai més. Ni que desapareguin les muntanyes i se somoguin els turons, no desapareixerà l’amor que jo et tinc ni se somourà el meu pacte de pau, diu el Senyor, el qui t’estima. Oh pobra, batuda per les tempestes, desolada. Faré reposar els teus carreus sobre una roca d’antimoni, i et donaré uns fonaments de safir; faré de robins els teus merlets, les teves portes de carboncle i tot el teu recinte de pedres precioses. Tots els qui et reconstruiran treballaran instruïts pel Senyor i serà gran el benestar dels teus fills. Quedaràs sòlidament restaurada, voltada d’estimació, lluny de tota amenaça: no hauràs de témer per res; lluny de tot terror: no s’acostarà vora teu.";
    massLiturgy.Today.FourthPsalm.Quote = "29,2 i 4.5-6.11 i 12a i 13b (R.: 2a)";
    massLiturgy.Today.FourthPsalm.Psalm = "Amb quin goig us exalço, Senyor!\nM’heu tret a flor d’aigua quan m’ofegava,\ni no heu permès que s’alegrin els enemics.\nSenyor, m’heu arrencat de la terra dels morts,\nquan ja m’hi enfonsava, m’heu tornat la vida.\n\nR. Amb quin goig us exalço, Senyor.\n\nCanteu al Senyor els qui l’estimeu,\nenaltiu la seva santedat!\nEl seu rigor dura un instant;\nel seu favor, tota la vida.\nCap al tard tot eren plors,\nl’endemà són crits de joia. R.\n\nEscolteu, Senyor, compadiu-vos de mi;\najudeu-me, Senyor.\nHeu mudat en joia les meves penes.\nSenyor, Déu meu, us lloaré per sempre. R.";

    massLiturgy.Today.FifthReading.Quote = "Is 55,1-11";
    massLiturgy.Today.FifthReading.Comment = "Veniu a mi, i us saciareu de vida. Pactaré amb vosaltres una aliança eterna";
    massLiturgy.Today.FifthReading.Title = "Lectura del llibre d’Isaïes";
    massLiturgy.Today.FifthReading.Reading = "Això diu el Senyor: «Oh, tots els assedegats, veniu a l’aigua, veniu, els qui no teniu diners, compreu i mengeu, compreu llet i vi sense diners, sense pagar res. Per què perdeu els diners comprant un pa que no alimenta, i malgasteu els vostres guanys en menjars que no satisfan? Escolteu bé, i tastareu cosa bona, i us delectareu assaborint el bo i millor. Estigueu atents, veniu a mi, i us saciareu de vida. Pactaré amb vosaltres una aliança eterna, els favors irrevocables promesos a David. Vaig fer-lo testimoni davant els pobles, sobirà i legislador de nacions. Cridaràs una nació que tu no coneixies, i aquesta nació, sense conèixer-te, vindrà corrents, buscant el Senyor, el teu Déu, el sant d’Israel, que t’ha honorat.\nCerqueu el Senyor, ara que es deixa trobar, invoqueu-lo ara que és a prop. Que els injustos abandonin els seus camins, i els homes malèfics, els seus propòsits; que es converteixin al Senyor i s’apiadarà d’ells, que tornin al nostre Déu, tan generós a perdonar. Perquè els meus pensaments no són els vostres, i els vostres camins no són els meus, diu l’oracle del Senyor. Els meus camins i els meus pensaments estan per damunt dels vostres, tant com la distància del cel a la terra.\nAixí com la pluja i la neu cauen del cel i no hi tornen, sinó que amaren la terra, la fecunden i la fan germinar, fins que dona el gra per a la sembra i el pa per a menjar, així serà la paraula que surt del meus llavis: no tornarà infecunda, sense haver fet el que jo volia i haver complert la missió que jo li havia confiat».";
    massLiturgy.Today.FifthPsalm.Quote = "Is 12,2.3-4bcd.5-6 (R.: 3)";
    massLiturgy.Today.FifthPsalm.Psalm = "El Senyor és el Déu que em salva,\nconfio, no m’espanto.\nD’ell em ve la força i el triomf,\nés ell qui m’ha salvat.\n\nR. Cantant de goig sortirem a buscar l’aigua\nde les fonts de salvació.\n\nCantant de goig sortirem a buscar l’aigua\nde les fonts de salvació.\nEnaltiu el Senyor, proclameu el seu nom,\nfeu conèixer entre els pobles les seves gestes.\nRecordeu que el seu nom és Excels. R.\n\nCanteu al Senyor, que ha fet coses glorioses.\nQue ho publiquin per tota la terra.\nPoble de Sió, aclama’l ple de goig,\nperquè el Sant d’Israel\nés gran a la teva ciutat. R.";

    massLiturgy.Today.SixthReading.Quote = "Ba 3,9-15.32–4,4";
    massLiturgy.Today.SixthReading.Comment = "Avança pel camí que condueix a la claror del Senyor";
    massLiturgy.Today.SixthReading.Title = "Lectura del llibre de Baruc";
    massLiturgy.Today.SixthReading.Reading = "Escolta, Israel, els preceptes de vida, estigues atent i aprendràs la prudència. Què ho fa, Israel, que et trobes en país enemic i t’has fet vell en una terra que no és teva, que tothom evita el teu contacte com evitaria el contacte d’un difunt, i et tracta igual que si fossis al país dels morts? És que has abandonat la font de la Saviesa. Si haguessis seguit el camí de Déu, hauries viscut en pau per sempre. Aprèn on es troba la prudència, on és el vigor, on és la intel·ligència, i coneixeràs al mateix temps on es troba la vida llarga i bona, on és la llum dels ulls i la pau. Però, qui ha descobert l’indret de la prudència? Qui ha penetrat a les cambres on guarda els tresors? Només la coneix el qui ho sap tot. És ell qui l’ha trobada amb el seu enteniment. Ell ha agençat la terra per sempre i l’ha poblada d’animals; quan envia la llum, ella se’n va; quan la crida, ella l’obeeix tremolant; les estrelles brillaven al lloc on es ponen, celebrant allà la seva festa; ell les cridà i li respongueren: «Aquí ens teniu», i amb alegria brillaven per al seu creador.\nEll és el nostre Déu, ningú no se li pot comparar. I és ell qui ha descobert tots els camins de la Saviesa i l’ha donada a Jacob, el seu servent, a Israel, el seu estimat. Després d’això s’aparegué aquí a la terra, on convisqué amb els homes. És això el llibre dels manaments de Déu, la llei que perdura per sempre més. Tots els qui la guarden s’encaminen a la vida, però els qui l’abandonen moriran. Retorna, poble de Jacob, i apodera-te’n, avança pel camí que condueix a la claror de la seva llum. No donis a un altre poble la teva glòria, no cedeixis el teu privilegi a una gent forastera. Que en som de feliços nosaltres, poble d’Israel! Nosaltres coneixem com hem d’agradar a Déu.";
    massLiturgy.Today.SixthPsalm.Quote = "18,8.9.10.11 (R.: Jo 6,68b)";
    massLiturgy.Today.SixthPsalm.Psalm = "És perfecta la llei del Senyor,\ni l’ànima hi descansa;\nés ferm el que el Senyor disposa,\ndona seny als ignorants.\nR. Senyor, vós teniu paraules de vida eterna.\nEls preceptes del Senyor són planers,\nomplen el cor de goig;\nels manaments del Senyor són transparents,\nil·luminen els ulls. R.\nVenerar el Senyor és cosa santa,\nes manté per sempre;\nels determinis del Senyor són ben presos,\ntots són justíssims. R.\nSón més desitjables que l’or fi,\nmés que l’or a mans plenes;\nsón més dolços que la mel\nregalimant de la bresca. R.";

    massLiturgy.Today.SeventhReading.Quote = "Ez 36,16-17a.18-28";
    massLiturgy.Today.SeventhReading.Comment = "Abocaré sobre vosaltres aigua pura i us donaré un cor nou";
    massLiturgy.Today.SeventhReading.Title = "Lectura de la profecia d’Ezequiel";
    massLiturgy.Today.SeventhReading.Reading = `El Senyor em va fer sentir la seva paraula i em digué: «Fill d’home, quan la casa d’Israel habitava el seu territori, el profanà amb el seu comportament i amb tot el que feia. Llavors vaig abocar sobre ells el meu rigor per la sang que havien vessat sobre aquella terra que ells havien profanat amb els seus ídols. Els vaig dispersar entre els pobles estrangers, els vaig escampar per diversos països en pena del seu comportament i de tot el que feien. Entre els pobles estrangers on anaren profanaren el meu nom, fent que diguessin d’ells: "Aquest era el poble del Senyor, i s’ha vist obligat a abandonar el seu país". Llavors m’ha dolgut de veure el meu sant nom profanat per la casa d’Israel entre els pobles estrangers on anaren. Per això digues a la casa d’Israel: Això diu el Senyor el teu Déu: "No obraré perquè vosaltres ho hàgiu merescut, casa d’Israel, sinó per consideració al meu sant nom, que vosaltres heu profanat entre els pobles estrangers on anàreu.Jo santificaré el meu nom, que ha quedat profanat entre els pobles estrangers, després que vosaltres l’heu profanat entre ells.I quan jo manifestaré en vosaltres la meva santedat, als ulls dels pobles estrangers, sabran que jo soc el Senyor Déu.Us prendré d’entre els pobles estrangers, us aplegaré de tots els països i us faré venir a la vostra terra.Abocaré sobre vosaltres aigua pura perquè sigueu purs de tota màcula i de tots els vostres ídols.Us donaré un cor nou i posaré un esperit nou dins vostre; trauré de vosaltres aquest cor de pedra i us en donaré un de carn.Posaré dins vostre el meu esperit i faré que seguiu els meus decrets, que compliu i observeu les meves decisions.Habitareu el país que vaig donar als vostres pares.Vosaltres sereu el meu poble, i jo seré el vostre Déu"».`;
    massLiturgy.Today.SeventhPsalm.Quote = "41,3.5bcd;42,3.4 (R.: 41,2)";
    massLiturgy.Today.SeventhPsalm.Psalm = "Tot jo tinc set de Déu, del Déu que m’és vida;\nquan podré veure Déu cara a cara?\n\nR. Com la cérvola es deleix per l’aigua viva,\ntambé em deleixo jo per vós, Déu meu.\n\nRecordo com en altres temps\nvenia amb colles d’amics\ncap a la casa de Déu,\nenmig d’un aplec festiu,\namb crits d’alegria i de lloança. R.\n\nEnvieu-me la llum i la veritat;\nque elles em guiïn,\nque em duguin a la muntanya sagrada,\nal lloc on residiu. R.\n\nI m’acostaré a l’altar de Déu,\na Déu, que és la meva alegria;\nho celebraré i us lloaré amb la cítara,\nSenyor, Déu meu. R.";

    massLiturgy.Today.ApostleReading.Quote = "Rm 6,3-11";
    massLiturgy.Today.ApostleReading.Comment = "Crist, un cop ressuscitat d’entre els morts, ja no mor més";
    massLiturgy.Today.ApostleReading.Title = "Lectura de la carta de sant Pau als cristians de Roma";
    massLiturgy.Today.ApostleReading.Reading = "Germans, tots els qui hem estat batejats en Jesucrist hem estat submergits en la seva mort. Pel baptisme hem estat sepultats amb ell en la mort, perquè, tal com Crist, gràcies al poder admirable del Pare, va ser ressuscitat d’entre els morts, també nosaltres emprenguem una nova vida. I si nosaltres hem estat plantats vora d’ell per aquesta mort semblant a la seva, també hem de ser-ho per la resurrecció. Queda ben clar: l’home que érem abans ha estat crucificat amb ell, perquè el cos pecador perdi el seu domini i d’ara endavant no sigueu esclaus del pecat: els qui són morts queden desvinculats del pecat.\nI si hem mort amb Crist, creiem que també viurem amb ell. I sabem que Crist, un cop ressuscitat d’entre els morts, ja no mor més, la mort ja no té cap poder sobre d’ell. Quan ell morí, morí al pecat una vegada per sempre, però ara que viu, viu per a Déu. Igualment vosaltres, penseu que sou morts pel que fa al pecat, però viviu per a Déu en Jesucrist.";

    massLiturgy.Today.Hallelujah.Quote = "Salm 117,1-2.16ab-17,22-23";
    massLiturgy.Today.Hallelujah.Hallelujah = "Enaltiu el Senyor: Que n’és de bo,\nperdura eternament el seu amor.\nQue respongui la casa d’Israel:\nperdura eternament el seu amor.\n\nR. Al·leluia, al·leluia, al·leluia.\n\nLa dreta del Senyor fa proeses,\nla dreta del Senyor em glorifica.\nNo moriré, viuré encara,\nper contar les proeses del Senyor. R.\n\nLa pedra que rebutjaven els constructors\nara corona l’edifici.\nÉs el Senyor qui ho ha fet,\ni els nostres ulls se’n meravellen. R.";

    let gospel = new MassGospel();
    switch (liturgySpecificDayInformation.YearType) {
        case YearType.A:
            gospel.Quote = "Mt 28,1-10";
            gospel.Comment = "Ha ressuscitat i anirà davant vostre a Galilea";
            gospel.Title = "Lectura de l’evangeli segons sant Mateu";
            gospel.Gospel = "Passat el dissabte, quan ja clarejava el matí del diumenge, Maria Magdalena i l’altra Maria anaren a veure el sepulcre. De cop i volta se sentí un gran terratrèmol: un àngel del Senyor, baixat del cel, havia fet rodolar la pedra i s’hi havia assegut. Resplendia com un llamp i el seu vestit era blanc com la neu. Va ser tan gran el sobresalt dels guardes, que de l’esglai quedaren com morts. L’àngel del Senyor digué a les dones: «No tingueu por, vosaltres. Sé que busqueu Jesús, el crucificat. No hi és, aquí. Ha ressuscitat tal com ho havia predit. Veniu a veure el lloc on havia estat posat, i aneu de seguida a dir als deixebles: Ha ressuscitat d’entre els morts i anirà davant vostre a Galilea; allà el veureu. Mireu que jo us ho he dit». Immediatament elles, amb por, però amb una gran alegria, se n’anaren corrents del sepulcre per anunciar-ho als deixebles. Jesús els sortí al pas i les saludà dient-los: «Déu vos guard». Elles se li acostaren, se li abraçaren als peus i l’adoraren. Jesús els digué. «No tingueu por. Aneu a dir als meus germans que vagin a Galilea i que allà em veuran».";
            break;
        case YearType.B:
            gospel.Quote = "Mc 16,1-8";
            gospel.Comment = "Jesús de Natzaret, el crucificat, ha ressuscitat";
            gospel.Title = "Lectura de l’evangeli segons sant Marc";
            gospel.Gospel = "Acabat el repòs del dissabte, Maria Magdalena, Maria, la mare de Jaume, i Salomé compraren espècies aromàtiques per anar a ungir el cos de Jesús. El diumenge, molt de matí, arribaren al sepulcre a la sortida del sol. Entre elles preguntaven: «Qui ens farà rodolar la pedra que tanca l’entrada del sepulcre?». Llavors alçaren els ulls i s’adonaren que la pedra ja havia estat apartada. Era una pedra realment molt grossa. Entraren al sepulcre, veieren, assegut a la dreta, un jove vestit de blanc, i s’esglaiaren. Ell els diu: «No tingueu por. Busqueu Jesús de Natzaret, el crucificat. Ha ressuscitat, no hi és, aquí. Mireu el lloc on l’havien posat. I ara aneu a dir als deixebles i a Pere que anirà davant vostre a Galilea; allà el veureu, tal com ell us ho havia dit». Elles sortiren del sepulcre i fugiren. Tremolaven d’esglai i, de por que tenien, no s’atreviren a dir res a ningú.";
            break;
        case YearType.C:
            gospel.Quote = "Lc 24,1-12";
            gospel.Comment = "Per què busqueu entre els morts aquell que viu?";
            gospel.Title = "Lectura de l’evangeli segons sant Lluc";
            gospel.Gospel = "El diumenge, molt de matí, les dones anaren al sepulcre amb les espècies aromàtiques que havien preparat. Trobaren que la pedra havia estat apartada de l’entrada del sepulcre. Hi entraren, però no trobaren el cos de Jesús, el Senyor. Mentre es preguntaven què havia passat, se’ls presentaren dos homes amb vestits resplendents. Esglaiades, s’inclinaren amb la cara fins a terra, i ells els digueren: «Per què busqueu entre els morts aquell que viu? No hi és, aquí: ha ressuscitat. Recordeu com us parlava quan era a Galilea, i us deia que el Fill de l’home havia de ser entregat a uns homes pecadors, que havia de ser crucificat i que, al tercer dia, havia de ressuscitar». Llavors es recordaren del que Jesús havia predit. Se’n tornaren del sepulcre i anunciaren tot això als onze i a tots els altres. Aquestes dones eren Maria Magdalena, Joana, i Maria, mare de Jaume. També les altres que eren amb elles els ho deien. Però als apòstols aquesta història els semblà una quimera, i no se les cregueren. Pere se n’anà corrents al sepulcre, s’ajupí per mirar dintre i veié que no hi havia res més que el llençol d’amortallar tot aplanat, i se’n tornà a casa, preguntant- se amb estranyesa què podia haver passat.";
            break;
    }
    massLiturgy.Today.Gospel = gospel;

    return massLiturgy;
}

function GetSpecialVespersIdentifier(tomorrowLiturgyDayInformation: LiturgySpecificDayInformation): number {
    if (CelebrationIdentifierService.IsSaintJohnBaptist(tomorrowLiturgyDayInformation.Date))
        return SoulKeys.LDSantoral_NaixamentJoanBaptista;
    if (CelebrationIdentifierService.IsSantsPerePau(tomorrowLiturgyDayInformation.Date))
        return SoulKeys.LDSantoral_SantsPerePau;
    if (CelebrationIdentifierService.IsAssumption(tomorrowLiturgyDayInformation.Date))
        return SoulKeys.LDSantoral_AssumpcioBenauradaVergeMaria;
    if (CelebrationIdentifierService.IsChristmas(tomorrowLiturgyDayInformation.Date))
        return SoulKeys.LDSantoral_Nadal;
    if (CelebrationIdentifierService.IsPentecost(tomorrowLiturgyDayInformation)) {
        switch (tomorrowLiturgyDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_PentecostaA;
            case YearType.B:
                return SoulKeys.LDSantoral_PentecostaB;
            case YearType.C:
                return SoulKeys.LDSantoral_PentecostaC;
        }
    }
    return -1;
}

function GetCelebrationVariableIdentifier(liturgySpecificDayInformation: LiturgySpecificDayInformation): number {
    if (CelebrationIdentifierService.JesusChristHighPriestForever(liturgySpecificDayInformation)) {
        return liturgySpecificDayInformation.YearIsEven? SoulKeys.LDSantoral_JesucristGranSacerdotPerSempreII : SoulKeys.LDSantoral_JesucristGranSacerdotPerSempreI;
    }

    if (CelebrationIdentifierService.IsImmaculateHeartOfTheBlessedVirginMary(liturgySpecificDayInformation) &&
        liturgySpecificDayInformation.CelebrationType === CelebrationType.Memory) {
        return SoulKeys.LDSantoral_CorImmaculatBenauradaVergeMaria;
    }

    if (CelebrationIdentifierService.IsMotherOfGodFromTheTibbon(liturgySpecificDayInformation.Date)) {
        return SoulKeys.LDSantoral_MareDeuCinta;
    }

    if (CelebrationIdentifierService.BlessedVirginMaryMotherOfTheChurch(liturgySpecificDayInformation)) {
        return liturgySpecificDayInformation.YearIsEven? SoulKeys.LDSantoral_BenauradaVergeMariaMareEsglesiaII : SoulKeys.LDSantoral_BenauradaVergeMariaMareEsglesiaI;
    }

    //Diumenge dins l’Octava de Nadal A (146) B (149) C (152)
    if (liturgySpecificDayInformation.Date.getMonth() == 11 &&
        liturgySpecificDayInformation.Date.getDay() == 0 &&
        liturgySpecificDayInformation.Date.getDate() >= 26 &&
        liturgySpecificDayInformation.Date.getDate() <= 31) {
        switch (liturgySpecificDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_SagradaFamiliaJesusMariaJosepA;
            case YearType.B:
                return SoulKeys.LDSantoral_SagradaFamiliaJesusMariaJosepB;
            case YearType.C:
                return SoulKeys.LDSantoral_SagradaFamiliaJesusMariaJosepC;
        }
    }

    //Diumenge després del dia 6 de gener A (157) B (158) C (159)
    if (liturgySpecificDayInformation.Date.getMonth() == 0 &&
        liturgySpecificDayInformation.Date.getDay() == 0 &&
        liturgySpecificDayInformation.Date.getDate() >= 7 &&
        liturgySpecificDayInformation.Date.getDate() <= 13) {
        switch (liturgySpecificDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_BaptismeSenyorA;
            case YearType.B:
                return SoulKeys.LDSantoral_BaptismeSenyorB;
            case YearType.C:
                return SoulKeys.LDSantoral_BaptismeSenyorC;
        }
    }

    if (CelebrationIdentifierService.IsHolyTrinity(liturgySpecificDayInformation)) {
        switch (liturgySpecificDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_SolemnitatSantissimaTrinitatA;
            case YearType.B:
                return SoulKeys.LDSantoral_SolemnitatSantissimaTrinitatB;
            case YearType.C:
                return SoulKeys.LDSantoral_SolemnitatSantissimaTrinitatC;
        }
    }

    if (CelebrationIdentifierService.IsHolyBodyAndBloodOfChrist(liturgySpecificDayInformation)) {
        switch (liturgySpecificDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_SantissimCosSangCristA;
            case YearType.B:
                return SoulKeys.LDSantoral_SantissimCosSangCristB;
            case YearType.C:
                return SoulKeys.LDSantoral_SantissimCosSangCristC;
        }
    }

    if (CelebrationIdentifierService.IsHolyHeartOfJesus(liturgySpecificDayInformation)) {
        switch (liturgySpecificDayInformation.YearType) {
            case YearType.A:
                return SoulKeys.LDSantoral_SagratCorJesusA;
            case YearType.B:
                return SoulKeys.LDSantoral_SagratCorJesusB;
            case YearType.C:
                return SoulKeys.LDSantoral_SagratCorJesusC;
        }
    }

    return -1;
}

function GetSpecialOptionalDayIdentifier(date: Date): number{
    // Pasqua 01-may -> 209 (Sant Josep obrer)
    if (date.getDate() == 1 && date.getMonth() == 4) {
        return SoulKeys.LDSantoral_SantJosepObrer;
    }

    // Ordinari 18-nov -> 210 ([-] Dedicació de les Basíliques dels sants Pere i Pau, apòstols)
    if (date.getDate() == 18 && date.getMonth() == 10) {
        return SoulKeys.LDSantoral_DedicacioBasiliquesSantsPerePauApostols;
    }

    // Ordinari 19-nov -> 211 ([BaD] Dedicació de les Basíliques dels sants Pere i Pau, apòstols)
    if (date.getDate() == 19 && date.getMonth() == 10) {
        return SoulKeys.LDSantoral_DedicacioBasiliquesSantsPerePauApostolsBaD;
    }

    // Nadal 03-ene -> 219 ([-] Santíssim Nom de Jesús)
    if (date.getDate() == 3 && date.getMonth() == 0) {
        return SoulKeys.LDSantoral_SantissimNomDeJesus;
    }
    return -1;
}