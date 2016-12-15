//DWZ Rechner - Ein Programm zum Berechnen von DWZ Zahlen von Schach Turnieren
//Copyright (C) 2015  Martin Schmuck m_schmuck@gmx.net
//
//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
//
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//You should have received a copy of the GNU General Public License
//along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Konstanten 
var ANZAHL_DWZ_FELDER = 9;
var TABELLENSPALTEN = 4;
var TABELLENZEILEN = 50;
var DWZ_DIFFERENZ_VON = 0;
var DWZ_DIFFERENZ_BIS = 1;
var DWZ_IST_BESSER = 2;
var DWZ_IST_SCHLECHTER = 3;
var DWZ_DIFFERENZ_MAXIMUM = 735;
var ALTER_BIS_20_JAHRE = 5;
var ALTER_VON_21_BIS_25_JAHRE = 10;
var ALTER_UEBER_25_JAHRE = 15;
var EULERSCHE_ZAHL = 2.718281828;
var P = 0;
var D = 1;
// Globale Variablen

// Formular Variablen
var formular_Alter;
var formular_EigeneDWZ;
var formular_GegnerDWZ = new Array(0);
var formular_Punkte = new Array(0);
var formular_AnzahlGegner;
//Entwicklungskoeffizient Variablen
var grundwert;
var beschleunigungsfaktor;
var bremszuschlag;
// Objekt Variablen
var player;
var opponent;

// Tabellen
var wahrscheinlichkeitsTabelle;
var wertungsdifferenzenTabelle;

function init() {
	var form = document.getElementById("rechnerFormular");
	form.addEventListener("focus", function( event ) {
		event.target.style.background = "#FFFFCC";    
	}, true);
	form.addEventListener("blur", function( event ) {
		event.target.style.background = "";    
	}, true);
	setFocus();
}
function berechnenButtonClicked() {
	if (readAndCheckFormularInputs() == true) {
		clearImage();
		initialisiereTabellen();
		calculateNewDWZ();
	}
	setFocus();
}

function clearImage() {
	document.getElementById("ergebnis").innerHTML = "&nbsp;";
}

function info() {
	if (document.getElementById("ergebnis").innerHTML == "&nbsp;") {
		document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="infobutton">&nbsp;</div>Dieser DWZ Rechner ist unter der GNU Lizenz zu haben.</div>';
	} else {
		document.getElementById("ergebnis").innerHTML = "&nbsp;";
	}
	setFocus();
}
function addFields() {
	var durchlauf = (ANZAHL_DWZ_FELDER - 9) / 3;
	for (var felder = 0;felder < durchlauf;felder++) {
		removeFields();
	}
	for (var felder = 0;felder < durchlauf + 1;felder++) {
		var inputFields = '<div  class="basic"><div class="field">DWZ: <input type="text" name="dwz" value="" size="4" onchange="checkDWZ(this)"></div><div class="field">Punkt: <select name="punkte"><option value="0"> 0</option><option value="0.5">0,5</option><option value="1"> 1</option></select></div></div>';
		var dwzbox = "";
		var boxName = "";
		var cleartags = '<div class="clear"></div>';
		for (var i = 0; i < 3;i++) {
			dwzbox += inputFields;
			ANZAHL_DWZ_FELDER++;
		}
		document.getElementById("moreFields").innerHTML += dwzbox + cleartags;

	}
	$(function() {
		$('select').selectmenu();
		$('input').textinput();
	});
	if (ANZAHL_DWZ_FELDER > 9) {
		for (var i = 9;i < ANZAHL_DWZ_FELDER - 3;i++) {
			document.getElementsByName("dwz")[i].value = formular_GegnerDWZ[i];
			document.getElementsByName("punkte")[i].value = formular_Punkte[i];
		}
	}
	setFocus();
 
}

function removeFields() {
	var inputFields = '<div  class="basic"><div class="field">DWZ: <input type="text" name="dwz" value="" size="4" onchange="checkDWZ(this)"></div><div class="field">Punkt: <select name="punkte"><option value="0"> 0</option><option value="0.5">0,5</option><option value="1"> 1</option></select></div></div>';
	var dwzbox = "";
	var boxName = "";
	var cleartags = '<div class="clear"></div>';
	var differenzFelder = ANZAHL_DWZ_FELDER - 9;
	if (ANZAHL_DWZ_FELDER > 9) {
		for (var i = 9;i < ANZAHL_DWZ_FELDER;i++) {
			formular_GegnerDWZ[i] = document.getElementsByName("dwz")[i].value;
			formular_Punkte[i] = document.getElementsByName("punkte")[i].value;
			formular_AnzahlGegner++;
		}
		document.getElementById("moreFields").innerHTML ="";
		ANZAHL_DWZ_FELDER = 9;
		for (var z = 0;z < differenzFelder / 3 - 1; z++) {
			for (var i = 0; i < 3;i++) {
				dwzbox += inputFields;
				ANZAHL_DWZ_FELDER++;
			}
			dwzbox += cleartags;
		}
		document.getElementById("moreFields").innerHTML += dwzbox;
		for (var i = 9;i < ANZAHL_DWZ_FELDER ;i++) {
			document.getElementsByName("dwz")[i].value = formular_GegnerDWZ[i];
			document.getElementsByName("punkte")[i].value = formular_Punkte[i];
		}
		berechnenButtonClicked();
	} else {
		document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="important">&nbsp;</div>9 DWZ Felder sind das Minimum.</div>';
		setTimeout("clearImage()",2000);
	}
	$(function() {
		$('select').selectmenu();
		$('input').textinput();
	});
	setFocus();
}

function resetAll() {
	document.getElementById("moreFields").innerHTML = "";
	document.getElementsByName("eigenedwz")[0].value = "";
	document.getElementsByName("alter")[0].selectedIndex = "2";
	document.getElementById("ergebnis").innerHTML = "";
	ANZAHL_DWZ_FELDER = document.getElementsByName("dwz").length;
	for(var i = 0;i < ANZAHL_DWZ_FELDER;i++) {
		document.getElementsByName("dwz")[i].value = "";
		document.getElementsByName("punkte")[i].selectedIndex = "0";
	}
	clearImage();
	setFocus();
}

function readAndCheckFormularInputs() {
	ANZAHL_DWZ_FELDER = document.getElementsByName("dwz").length;
	// Überprüfung auf korrekte Eingaben und einlesen der
	// Variablen aus dem Formular
	var numberDWZ = 0;
	var numberPunkte = 0;
	formular_AnzahlGegner = 0;
	formular_EigeneDWZ = document.getElementsByName("eigenedwz")[0].value;
	// Wenn die eigene DWZ richtig ist werden die Felder abgefragt
	formular_Alter = document.getElementsByName("alter")[0].value;
	//DWZ Felder und Punkte Selektoren abfragen
	if (testDWZRange(formular_EigeneDWZ) == true && formular_EigeneDWZ != "") {
		
		for(var i = 0;i < ANZAHL_DWZ_FELDER;i++) {
			numberDWZ = document.getElementsByName("dwz")[i].value;
			if (testDWZRange(numberDWZ) == true && numberDWZ != "") {
				// Wenn ein Feld eine korrekte Zahl hat, werden die
				// Daten ausgelesen
				formular_GegnerDWZ[formular_AnzahlGegner] = document.getElementsByName("dwz")[i].value;
				formular_Punkte[formular_AnzahlGegner] = document.getElementsByName("punkte")[i].value;
				formular_AnzahlGegner++;
			} 
			/*else {
				//Bei Feldern die keine Eingaben enthalten, wird das
				// Array auf -1 gesetzt um so später die Berechnungen korrekt durchführen
				// zu können.
				formular_GegnerDWZ[i] = -1;
			}*/
		}
		// Für den Fall, das keine Gegner eingegeben wurden:
		if(formular_AnzahlGegner == 0) {
			clearImage();
			document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="important">&nbsp;</div>Es muss mindestens eine gegnerische DWZ eingegeben werden.</div>';
			formular_AnzahlGegner = 0;
			setTimeout("clearImage()",2000);
			return false;
		
		} else {
			// Wenn alles in Ordnung ist, 
			// verlasse die Methode und gib true zurück
			// ansonsten gib false zurück
			return true;
		}
	} else {
		// Bei fehlender oder falscher Eingabe der eigenen DWZ gibt es einen Warnhinweis
		clearImage();
		document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="important">&nbsp;</div>Deine DWZ muss eine Zahl zwischen 0 und 3000 sein.</div>';
		formular_AnzahlGegner = 0;
		document.getElementsByName("eigenedwz")[0].value = "";
		document.getElementsByName("eigenedwz")[0].focus();	
		setTimeout("clearImage()",2000);
		return false;	
	}
	
}

function checkDWZ(field) {
		// Diese Funktion überprüft während der Eingabe
		// ob die eingegebene Zahl zwischen 0 und 3000 ist
		// und ob es sich um eine Zahl handelt.
		if (testDWZRange(field.value) == false) {
			field.value = "";
			field.blur();
			setFocus();
		} 
		
}

function setFocus() {
	var test = true;
	if (document.getElementsByName("eigenedwz")[0].value == "") {
		document.getElementsByName("eigenedwz")[0].focus();
	} else {
		for (var i = 0;i < ANZAHL_DWZ_FELDER;i++) {
			if (document.getElementsByName("dwz")[i].value == "" && test == true) {
				document.getElementsByName("dwz")[i].focus();
				test = false;
				
			} 
		}
	}
}

function testDWZRange(number) {
	// Diese Funktion überprüft während der Eingabe
	// ob die eingegebene Zahl zwischen 0 und 3000 ist
	// und ob es sich um eine Zahl handelt.
 
 	// Durchsuche den Einabetext nach Zeichen die keine Ziffern sind.
	var testAufZahlen = number.search(/[^1234567890]/);
	// testAufZahlen == -1 wenn es sich bei der Eingabe nur um Ziffern handelt
	if (testAufZahlen == -1 ) {
		if (number >= 0 && number <= 3000) {
			return true;
		}else {
			clearImage();
			document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="important">&nbsp;</div>Bitte gib eine Zahl zwischen 0 und 3000 ein.</div>';
			setTimeout("clearImage()",2000);
			return false;
		}
	}else {
		clearImage();
		document.getElementById("ergebnis").innerHTML = '<div class="notice"><div class="important">&nbsp;</div>Nur Zahlen sind erlaubt.</div>';
		setTimeout("clearImage()",2000);
		return false;		
	}
}

function calculateNewDWZ() {
	createObjects();
	berechnePunkteUndDurchschnittsDWZ();
	calculateWahrscheinlichkeitModel();
	player.leistungsDWZ = calcTurnierLeistung();
	entwicklungskoeffizientModel();
	folgeDWZModel();
	
	output();
}

function output() {
	var test = "<div class='notice'>" +
				"<div class='ergbnisbox'><div class='indexfeld'>alte DWZ:</div> <div class='ergebnisfeld'>" + player.oldDWZ + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>Gegneranzahl:</div> <div class='ergebnisfeld'>" + player.numberOfOpponents + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>Gesamtpunkte:</div> <div class='ergebnisfeld'>" + player.punkte + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>&#216; DWZ:</div> <div class='ergebnisfeld'>" + player.durchschnittderGegnerDWZ + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>Leistung:</div> <div class='ergebnisfeld'>" + player.leistungsDWZ + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>neue DWZ:</div> <div class='ergebnisfeld'>" + player.folgeDWZ + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>Punkterwartung:</div> <div class='ergebnisfeld'>" + player.punkterwartung + "</div></div>" +
				"<div class='ergbnisbox'><div class='indexfeld'>E:</div> <div class='ergebnisfeld'>" + player.entwicklungskoeffizient + "</div></div>";
				
	test += "<div class='clear'></div></div>";
	//document.getElementById("ergebnis").style.height = "auto";
	
	clearImage();
	document.getElementById("ergebnis").innerHTML = test;	
}
function createObjects() {
	player = {
		age : 0,
		oldDWZ : 0,
		folgeDWZ : 0,
		numberOfOpponents : 0,
		punkterwartung : 0,
		durchschnittderGegnerDWZ : 0,
		punkte : 0,
		leistungsDWZ : 0,
		entwicklungskoeffizient : 0	
	};
	player.age = formular_Alter;
	player.oldDWZ = parseInt(formular_EigeneDWZ);
	player.numberOfOpponents = parseInt(formular_AnzahlGegner);
	opponent = new Array(player.numberOfOpponents);
	for (var i = 0;i < player.numberOfOpponents;i++) {
		opponent[i] = new Object();
		opponent[i].dwz = parseInt(formular_GegnerDWZ[i]);
		if (formular_Punkte[i] == "0") {
			opponent[i].ergebnis = 0;
		}
		if (formular_Punkte[i] == "0.5") {
			opponent[i].ergebnis = 0.5;
		}
		if (formular_Punkte[i] == "1") {
			opponent[i].ergebnis = 1;
		}
		opponent[i].gewinnerwartung = 0;
	}	
}

function berechnePunkteUndDurchschnittsDWZ() {
	var dwzD = 0;
	var gesamtpunkte = 0;
	for (var i = 0; i < player.numberOfOpponents;i++) {
		dwzD = dwzD + opponent[i].dwz;
		gesamtpunkte += opponent[i].ergebnis;
	}	 
	player.punkte = gesamtpunkte;
	player.durchschnittderGegnerDWZ = Math.round(dwzD / player.numberOfOpponents);
}

	/**
	 * 
	 * @param player
	 *            : Der Spieler, der seine Leistungszahl errechnen will
	 * @param opponents
	 *            : Alle Gegner
	 * @return : Die Leistungszahl
	 */
	function calcTurnierLeistung() {
		// 4.7.2.1.2 Extremresultate: Boolean extremResultat = false;
		// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html
		var extremResultat = false;
		// Tabelle Anhang 2.2 Wertungsdifferenzen abhängig von
		// den Gewinnprozenten P
		// http://www.schachbund.de/anhang-22.html
		//WertungsdifferenzenTabelleModel wdTabelle = new WertungsdifferenzenTabelleModel();
		//double[][] wertungsdifferenzenTabelle = wdTabelle.getWertungsdifferenzenTabelle();

		// nach 4.7.2 We für bisher ungewertete Spieler
		// Quelle:
		// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html

	var leistungszahlSpieler = {
		age : 0,
		oldDWZ : 0,
		folgeDWZ : 0,
		numberOfOpponents : 0,
		punkterwartung : 0,
		durchschnittderGegnerDWZ : 0,
		punkte : 0,
		leistungsDWZ : 0,
		entwicklungskoeffizient : 0	
	};
	leistungszahlSpieler.punkte = player.punkte;
	leistungszahlSpieler.age = player.age;
	leistungszahlSpieler.durchschnittderGegnerDWZ = player.durchschnittderGegnerDWZ;
	leistungszahlSpieler.oldDWZ = player.oldDWZ ;
	leistungszahlSpieler.numberOfOpponents = player.numberOfOpponents;
	leistungszahlSpieler.punkterwartung = player.punkterwartung;
		var leistungszahlopponent = new Array(leistungszahlSpieler.numberOfOpponents);
	for (var i = 0;i < leistungszahlSpieler.numberOfOpponents;i++) {
		leistungszahlopponent[i] = new Object();
		leistungszahlopponent[i].dwz = parseInt(formular_GegnerDWZ[i]);
		if (formular_Punkte[i] == "0") {
			leistungszahlopponent[i].ergebnis = 0;
		}
		if (formular_Punkte[i] == "0.5") {
			leistungszahlopponent[i].ergebnis = 0.5;
		}
		if (formular_Punkte[i] == "1") {
			leistungszahlopponent[i].ergebnis = 1;
		}
		leistungszahlopponent[i].gewinnerwartung = 0;
	}	
		// 100% Gewinn (4.7.2.1.2 Extremresultate)
		// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html
		if (player.numberOfOpponents == player.punkte) {
			leistungszahlSpieler.oldDWZ = player.durchschnittderGegnerDWZ + 677;
			extremResultat = true;
		}
		// 0% Gewinn (4.7.2.1.2 Extremresultate)
		// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html
		if (player.punkte == 0) {
			leistungszahlSpieler.oldDWZ = player.durchschnittderGegnerDWZ - 677;
			extremResultat = true;
		}
		if (extremResultat == false) {
			var diff = 0;

			for (var i = 1; i < 100; i++) {
				if (leistungszahlSpieler.punkte == wertungsdifferenzenTabelle[P][i]) {
					diff = wertungsdifferenzenTabelle[D][i];
				}
			}
			leistungszahlSpieler.oldDWZ = Math.round(leistungszahlSpieler.durchschnittderGegnerDWZ + diff);

			var pD = 0;
			var dwz = 0;
			var d = 0;
			// Dies ist die Iteration (laut 4.7.2.1.3 Verbesserte erste DWZ
			// durch Iteration)
			// hier für die Berechnung der Leistungszahl.
			// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html

			// do {
			for (var iteration = 0; iteration < 1000; iteration++) {
				// Berechnung der Punkteerwartung nach Tabelle Anhang 2.1
				// Wahrscheinlichkeitstabelle
				// http://www.schachbund.de/anhang-21.html
				
								// Berechnung der Gewinnerwartung und der Punkterwartung
		var punkterwartung = 0;
		var gewinnerwartung = 0;
		for (var i = 0;i < leistungszahlSpieler.numberOfOpponents;i++) {
			leistungszahlopponent[i].gewinnerwartung = getWahrscheinlichkeit(leistungszahlSpieler.oldDWZ, leistungszahlopponent[i].dwz);
			punkterwartung += leistungszahlopponent[i].gewinnerwartung;
		}
		leistungszahlSpieler.punkterwartung = punkterwartung;
				dwz = parseInt(leistungszahlSpieler.oldDWZ);
				// P(D) - Durchschnitt = (W - We) / n + 0,500
				pD = (leistungszahlSpieler.punkte - leistungszahlSpieler.punkterwartung) / leistungszahlSpieler.numberOfOpponents	+ 0.5;
				pD = (Math.round(100.0 * pD)) / 100.0;
				// In der Tabelle Anhang 2.2 Wertungsdifferenzen abhängig von
				// den Gewinnprozenten P
				// nach der Differenz den Wert herraus suchen
				// http://www.schachbund.de/anhang-22.html
				for (var i = 1; i < 100; i++) {
					if (pD == wertungsdifferenzenTabelle[P][i]) {
						d = parseInt(wertungsdifferenzenTabelle[D][i]);
					}
				}
				// Formel Ro' = Ro + D
				// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html
				leistungszahlSpieler.oldDWZ = dwz + d;
				// Abbruchbedingung wenn W und We (annähernd) gleich sind
				// (Punkterwartung == Punkte)
				// verursachte Fehler, deshalb habe ich sie durch eine For
				// Schleife ersetzt
				// http://www.schachbund.de/id-47-die-berechnung-der-punkterwartung.html
				// } while ((Math.round(leistungszahlSpieler.getPunkte() * 100))
				// != (Math.round(leistungszahlSpieler.getPunkterwartung() *
				// 100)));
			}
		}
		// Rückgabe der Leistungszahl
		return parseInt(leistungszahlSpieler.oldDWZ);
	}
	 
function calculateWahrscheinlichkeitModel() {
		// Berechnung der Gewinnerwartung und der Punkterwartung
		var punkterwartung = 0;
		var gewinnerwartung = 0;
		for (var i = 0;i < player.numberOfOpponents;i++) {
			opponent[i].gewinnerwartung = getWahrscheinlichkeit(player.oldDWZ, opponent[i].dwz);
			punkterwartung += opponent[i].gewinnerwartung;
		}
		player.punkterwartung = Math.round(punkterwartung *1000) / 1000;
	}

	/**
	 * * Dies ist die Hauptroutine in der die Gewinnerwartung anhand der Tabelle
	 * vom DSB (http://www.schachbund.de/anhang-21.html) errechnet wird.
	 * 
	 * @param dwzPlayer
	 *            : Die DWZ des Spielers
	 * @param dwzOpponent
	 *            : Die DWZ des Gegners
	 * @return gewinnErwartungPD : Die prozentuale Gewinnerwartung
	 */
	function getWahrscheinlichkeit(dwzPlayer, dwzOpponent) {
		// Für den Fall eines Fehlers initialisiere ich
		// die Variablen mit korrektenen Werten
		var spielerStaerke = DWZ_IST_BESSER;
		var dwzDifferenz = 0;
		var gewinnErwartungPD = 0.500;
		var allesInOrdnung = false;

		if (dwzPlayer > dwzOpponent) {
			// Wenn der Spieler bessser als sein Gegner ist...
			spielerStaerke = DWZ_IST_BESSER;
			dwzDifferenz = dwzPlayer - dwzOpponent;
			allesInOrdnung = true;
		} else {
			// Wenn der Spieler schlechter als sein Gegner ist...
			spielerStaerke = DWZ_IST_SCHLECHTER;
			dwzDifferenz = dwzOpponent - dwzPlayer;
			allesInOrdnung = true;
		}

		// Wenn ein Fehler auftritt soll eine Exception
		// ausgeworfen werden
		if (allesInOrdnung == false) {
			// TODO EXCEPTION auswerfen (allesInOrdnung == false)
		}
		// Wenn die DWZ Differenz kleiner als 736 ist, dann wird
		// die Gewinnerwartung in der Tabelle gesucht.
		if (dwzDifferenz <= DWZ_DIFFERENZ_MAXIMUM) {
			allesInOrdnung = false;
			// hier wird in der Tabelle die Gewinnerwartung anhand der DWZ
			// Differenz gesucht.
			for (var i = 0; i < TABELLENZEILEN; i++) {
				// Hier ist die Suchabfrage durch die DWZ Differenz
				if (dwzDifferenz >= wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][i]
						&& dwzDifferenz <= wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][i]) {

					gewinnErwartungPD = wahrscheinlichkeitsTabelle[spielerStaerke][i];

					allesInOrdnung = true;

				}

			}
		} else {
			// Wenn die DWZ Differenz größer als 735 ist, dann ist die
			// Wahrscheinlichkeit gleich eins (100%)
			if (spielerStaerke == DWZ_IST_BESSER) {
			gewinnErwartungPD = 1.0;
			} else {
				gewinnErwartungPD = 0.0;
			}
			allesInOrdnung = true;
		}

		// Wenn ein Fehler auftritt soll eine Exception
		// ausgeworfen werden
		if (allesInOrdnung == false) {
			// TODO EXCEPTION auswerfen (allesInOrdnung == false)
		}
		return gewinnErwartungPD;
	}	
	
	function entwicklungskoeffizientModel() {

		grundwert = grundwertBerechnen();
		beschleunigungsfaktor = beschleunigungsfaktorBerechnen();
		bremszuschlag = bremszuschlagBerechnen();
		player.entwicklungskoeffizient = grundwert * beschleunigungsfaktor + bremszuschlag;
		// Für E gelten folgende Begrenzungen:
		// Der Wert von E ist stets ganzzahlig gerundet anzusetzen.
		// Er ist abhängig vom Index und muss mindestens 5 betragen.
		// Sein Maximalwert ist 30 bzw. 5 x Index bei SBr = 0, er darf für SBr ≥
		// 0 den Wert von 150 #
		// nicht überschreiten.
		// Für Spieler ohne Wertungszahl wird bei der Ermittlung von E
		// der Index 1 verwendet. Es gilt:
		//
		// E ≥ 5 und E ≤ 30
		//
		// bzw.
		// 5 x Index (für SBr = 0)
		//
		// und
		// E ≤ 150 (SBr ≥ 0)
		begrenzeEntwicklungskoeffizient();
		// Der Wert von E ist stets ganzzahlig gerundet anzusetzen.

		player.entwicklungskoeffizient = Math.round(player.entwicklungskoeffizient);

	}

	function begrenzeEntwicklungskoeffizient() {
		// TODO Auto-generated method stub
		if (player.entwicklungskoeffizient < 5) {
			player.entwicklungskoeffizient = 5;
		}
		if (bremszuschlag == 0) {
			// 5 x Index (für SBr = 0)
			// hier bräuchte ich die Index Zahl!
			if (player.entwicklungskoeffizient > 30) {
				player.entwicklungskoeffizient = 30;
			}

		} else {

			if (player.entwicklungskoeffizient > 150) {
				player.entwicklungskoeffizient = 150;
			}
		}

	}

	function bremszuschlagBerechnen() {
		// SBr = e (1300-Ro)/150 - 1
		//
		// nur für R0 < 1300 und W ≤ We, sonst SBr = 0.
		//
		// Anmerkung: e, genannt Eulersche Zahl, ist die Basiszahl des
		// natürlichen Logarithmus und hat als Größe die Zahl 2,7 und daran
		// anschließend zweimal das Gründungsjahr der Universität Dresden, also
		// 2,718281828.
		//
		// Für E gelten folgende Begrenzungen:
		// Der Wert von E ist stets ganzzahlig gerundet anzusetzen. Er ist
		// abhängig vom Index und muss mindestens 5 betragen. Sein Maximalwert
		// ist 30 bzw. 5 x Index bei SBr = 0, er darf für SBr ≥ 0 den Wert von
		// 150 nicht überschreiten. Für Spieler ohne Wertungszahl wird bei der
		// Ermittlung von E der Index 1 verwendet. Es gilt:
		// E ≥ 5 und E ≤ 30
		//
		// bzw.
		// 5 x Index (für SBr = 0)
		//
		// und
		// E ≤ 150 (SBr ≥ 0)
		var sBr = 0;
		if (player.oldDWZ < 1300 && player.punkte <= player.punkterwartung) {
			var DWZkleiner1300 = (1300 - player.oldDWZ) / 150;
			sBr = Math.pow(EULERSCHE_ZAHL, DWZkleiner1300) - 1;
		} else {
			sBr = 0;
		}
		return sBr;
	}

	function beschleunigungsfaktorBerechnen() {
		// fB = Ro / 2000 mit 0,5 ≤ fB ≤ 1,0
		// nur für Jugendliche bis 20 Jahre bei W ≥ We, sonst fB = 1.
		var fb = 1;
		if (player.age == 0 && player.punkte >= player.punkterwartung) {
			fb = player.oldDWZ / 2000;
			if (fb < 0.5 || fb > 1.0) {
				fb = 1;
			}
		}
		return fb;
	}

	function grundwertBerechnen() {
		// E0 = (Ro / 1000 )4 + J
		var j = 0;
		if (player.age == 0) {
			j = ALTER_BIS_20_JAHRE;
		}
		if (player.age == 1) {
			j = ALTER_VON_21_BIS_25_JAHRE;
		}
		if (player.age == 2) {
			j = ALTER_UEBER_25_JAHRE;
		}
		var ageD1000 = player.oldDWZ / 1000;
		return Math.pow(ageD1000, 4) + j;
	}	
	 
function folgeDWZModel() {

		// Rn = Ro + 800 x (W - We) / (E + n)
		player.folgeDWZ = 0;
		player.folgeDWZ = Math.round(player.oldDWZ	+ (800 * (player.punkte - player.punkterwartung) / (player.entwicklungskoeffizient + player.numberOfOpponents)));
}
	
function initialisiereTabellen() {
		// Wahrscheinlichkeitstabelle erstellen
		wahrscheinlichkeitsTabelle = new Array(4);
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON] = new Array(50);
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS] = new Array(50);
		wahrscheinlichkeitsTabelle[DWZ_IST_BESSER] = new Array(50);
		wahrscheinlichkeitsTabelle[DWZ_IST_SCHLECHTER] = new Array(50);
		tabellemitDWZDifferenzenFuellen();
		tabellemitGewinnErwartungenFuellen();
		
		// Wertungsdifferenzentabelle erstellen
		wertungsdifferenzenTabelle = new Array(2);
		wertungsdifferenzenTabelle[D] = new Array(100);
		wertungsdifferenzenTabelle[P] = new Array(100);
		tabellemitWertungsdifferenzenFuellen();
}

function tabellemitWertungsdifferenzenFuellen() {
		wertungsdifferenzenTabelle[D][1] = -677;
		wertungsdifferenzenTabelle[D][2] = -589;
		wertungsdifferenzenTabelle[D][3] = -538;
		wertungsdifferenzenTabelle[D][4] = -501;
		wertungsdifferenzenTabelle[D][5] = -470;
		wertungsdifferenzenTabelle[D][6] = -444;
		wertungsdifferenzenTabelle[D][7] = -422;
		wertungsdifferenzenTabelle[D][8] = -401;
		wertungsdifferenzenTabelle[D][9] = -383;
		wertungsdifferenzenTabelle[D][10] = -366;
		wertungsdifferenzenTabelle[D][11] = -351;
		wertungsdifferenzenTabelle[D][12] = -336;
		wertungsdifferenzenTabelle[D][13] = -322;
		wertungsdifferenzenTabelle[D][14] = -309;
		wertungsdifferenzenTabelle[D][15] = -296;
		wertungsdifferenzenTabelle[D][16] = -284;
		wertungsdifferenzenTabelle[D][17] = -273;
		wertungsdifferenzenTabelle[D][18] = -262;
		wertungsdifferenzenTabelle[D][19] = -251;
		wertungsdifferenzenTabelle[D][20] = -240;
		wertungsdifferenzenTabelle[D][21] = -230;
		wertungsdifferenzenTabelle[D][22] = -220;
		wertungsdifferenzenTabelle[D][23] = -211;
		wertungsdifferenzenTabelle[D][24] = -202;
		wertungsdifferenzenTabelle[D][25] = -193;
		wertungsdifferenzenTabelle[D][26] = -184;
		wertungsdifferenzenTabelle[D][27] = -175;
		wertungsdifferenzenTabelle[D][28] = -166;
		wertungsdifferenzenTabelle[D][29] = -158;
		wertungsdifferenzenTabelle[D][30] = -149;
		wertungsdifferenzenTabelle[D][31] = -141;
		wertungsdifferenzenTabelle[D][32] = -133;
		wertungsdifferenzenTabelle[D][33] = -125;
		wertungsdifferenzenTabelle[D][34] = -117;
		wertungsdifferenzenTabelle[D][35] = -110;
		wertungsdifferenzenTabelle[D][36] = -102;
		wertungsdifferenzenTabelle[D][37] = -95;
		wertungsdifferenzenTabelle[D][38] = -87;
		wertungsdifferenzenTabelle[D][39] = -80;
		wertungsdifferenzenTabelle[D][40] = -72;
		wertungsdifferenzenTabelle[D][41] = -65;
		wertungsdifferenzenTabelle[D][42] = -57;
		wertungsdifferenzenTabelle[D][43] = -50;
		wertungsdifferenzenTabelle[D][44] = -43;
		wertungsdifferenzenTabelle[D][45] = -36;
		wertungsdifferenzenTabelle[D][46] = -29;
		wertungsdifferenzenTabelle[D][47] = -21;
		wertungsdifferenzenTabelle[D][48] = -14;
		wertungsdifferenzenTabelle[D][49] = -7;
		wertungsdifferenzenTabelle[D][50] = 0;
		wertungsdifferenzenTabelle[D][51] = 7;
		wertungsdifferenzenTabelle[D][52] = 14;
		wertungsdifferenzenTabelle[D][53] = 21;
		wertungsdifferenzenTabelle[D][54] = 29;
		wertungsdifferenzenTabelle[D][55] = 36;
		wertungsdifferenzenTabelle[D][56] = 43;
		wertungsdifferenzenTabelle[D][57] = 50;
		wertungsdifferenzenTabelle[D][58] = 57;
		wertungsdifferenzenTabelle[D][59] = 65;
		wertungsdifferenzenTabelle[D][60] = 72;
		wertungsdifferenzenTabelle[D][61] = 80;
		wertungsdifferenzenTabelle[D][62] = 87;
		wertungsdifferenzenTabelle[D][63] = 95;
		wertungsdifferenzenTabelle[D][64] = 102;
		wertungsdifferenzenTabelle[D][65] = 110;
		wertungsdifferenzenTabelle[D][66] = 117;
		wertungsdifferenzenTabelle[D][67] = 125;
		wertungsdifferenzenTabelle[D][68] = 133;
		wertungsdifferenzenTabelle[D][69] = 141;
		wertungsdifferenzenTabelle[D][70] = 149;
		wertungsdifferenzenTabelle[D][71] = 158;
		wertungsdifferenzenTabelle[D][72] = 166;
		wertungsdifferenzenTabelle[D][73] = 175;
		wertungsdifferenzenTabelle[D][74] = 184;
		wertungsdifferenzenTabelle[D][75] = 193;
		wertungsdifferenzenTabelle[D][76] = 202;
		wertungsdifferenzenTabelle[D][77] = 211;
		wertungsdifferenzenTabelle[D][78] = 220;
		wertungsdifferenzenTabelle[D][79] = 230;
		wertungsdifferenzenTabelle[D][80] = 240;
		wertungsdifferenzenTabelle[D][81] = 251;
		wertungsdifferenzenTabelle[D][82] = 262;
		wertungsdifferenzenTabelle[D][83] = 273;
		wertungsdifferenzenTabelle[D][84] = 284;
		wertungsdifferenzenTabelle[D][85] = 296;
		wertungsdifferenzenTabelle[D][86] = 309;
		wertungsdifferenzenTabelle[D][87] = 322;
		wertungsdifferenzenTabelle[D][88] = 336;
		wertungsdifferenzenTabelle[D][89] = 351;
		wertungsdifferenzenTabelle[D][90] = 366;
		wertungsdifferenzenTabelle[D][91] = 383;
		wertungsdifferenzenTabelle[D][92] = 401;
		wertungsdifferenzenTabelle[D][93] = 422;
		wertungsdifferenzenTabelle[D][94] = 444;
		wertungsdifferenzenTabelle[D][95] = 470;
		wertungsdifferenzenTabelle[D][96] = 501;
		wertungsdifferenzenTabelle[D][97] = 538;
		wertungsdifferenzenTabelle[D][98] = 589;
		wertungsdifferenzenTabelle[D][99] = 677;

		wertungsdifferenzenTabelle[P][1] = 0.01;
		wertungsdifferenzenTabelle[P][2] = 0.02;
		wertungsdifferenzenTabelle[P][3] = 0.03;
		wertungsdifferenzenTabelle[P][4] = 0.04;
		wertungsdifferenzenTabelle[P][5] = 0.05;
		wertungsdifferenzenTabelle[P][6] = 0.06;
		wertungsdifferenzenTabelle[P][7] = 0.07;
		wertungsdifferenzenTabelle[P][8] = 0.08;
		wertungsdifferenzenTabelle[P][9] = 0.09;
		wertungsdifferenzenTabelle[P][10] = 0.10;
		wertungsdifferenzenTabelle[P][11] = 0.11;
		wertungsdifferenzenTabelle[P][12] = 0.12;
		wertungsdifferenzenTabelle[P][13] = 0.13;
		wertungsdifferenzenTabelle[P][14] = 0.14;
		wertungsdifferenzenTabelle[P][15] = 0.15;
		wertungsdifferenzenTabelle[P][16] = 0.16;
		wertungsdifferenzenTabelle[P][17] = 0.17;
		wertungsdifferenzenTabelle[P][18] = 0.18;
		wertungsdifferenzenTabelle[P][19] = 0.19;
		wertungsdifferenzenTabelle[P][20] = 0.20;
		wertungsdifferenzenTabelle[P][21] = 0.21;
		wertungsdifferenzenTabelle[P][22] = 0.22;
		wertungsdifferenzenTabelle[P][23] = 0.23;
		wertungsdifferenzenTabelle[P][24] = 0.24;
		wertungsdifferenzenTabelle[P][25] = 0.25;
		wertungsdifferenzenTabelle[P][26] = 0.26;
		wertungsdifferenzenTabelle[P][27] = 0.27;
		wertungsdifferenzenTabelle[P][28] = 0.28;
		wertungsdifferenzenTabelle[P][29] = 0.29;
		wertungsdifferenzenTabelle[P][30] = 0.30;
		wertungsdifferenzenTabelle[P][31] = 0.31;
		wertungsdifferenzenTabelle[P][32] = 0.32;
		wertungsdifferenzenTabelle[P][33] = 0.33;
		wertungsdifferenzenTabelle[P][34] = 0.34;
		wertungsdifferenzenTabelle[P][35] = 0.35;
		wertungsdifferenzenTabelle[P][36] = 0.36;
		wertungsdifferenzenTabelle[P][37] = 0.37;
		wertungsdifferenzenTabelle[P][38] = 0.38;
		wertungsdifferenzenTabelle[P][39] = 0.39;
		wertungsdifferenzenTabelle[P][40] = 0.40;
		wertungsdifferenzenTabelle[P][41] = 0.41;
		wertungsdifferenzenTabelle[P][42] = 0.42;
		wertungsdifferenzenTabelle[P][43] = 0.43;
		wertungsdifferenzenTabelle[P][44] = 0.44;
		wertungsdifferenzenTabelle[P][45] = 0.45;
		wertungsdifferenzenTabelle[P][46] = 0.46;
		wertungsdifferenzenTabelle[P][47] = 0.47;
		wertungsdifferenzenTabelle[P][48] = 0.48;
		wertungsdifferenzenTabelle[P][49] = 0.49;
		wertungsdifferenzenTabelle[P][50] = 0.50;
		wertungsdifferenzenTabelle[P][51] = 0.51;
		wertungsdifferenzenTabelle[P][52] = 0.52;
		wertungsdifferenzenTabelle[P][53] = 0.53;
		wertungsdifferenzenTabelle[P][54] = 0.54;
		wertungsdifferenzenTabelle[P][55] = 0.55;
		wertungsdifferenzenTabelle[P][56] = 0.56;
		wertungsdifferenzenTabelle[P][57] = 0.57;
		wertungsdifferenzenTabelle[P][58] = 0.58;
		wertungsdifferenzenTabelle[P][59] = 0.59;
		wertungsdifferenzenTabelle[P][60] = 0.60;
		wertungsdifferenzenTabelle[P][61] = 0.61;
		wertungsdifferenzenTabelle[P][62] = 0.62;
		wertungsdifferenzenTabelle[P][63] = 0.63;
		wertungsdifferenzenTabelle[P][64] = 0.64;
		wertungsdifferenzenTabelle[P][65] = 0.65;
		wertungsdifferenzenTabelle[P][66] = 0.66;
		wertungsdifferenzenTabelle[P][67] = 0.67;
		wertungsdifferenzenTabelle[P][68] = 0.68;
		wertungsdifferenzenTabelle[P][69] = 0.69;
		wertungsdifferenzenTabelle[P][70] = 0.70;
		wertungsdifferenzenTabelle[P][71] = 0.71;
		wertungsdifferenzenTabelle[P][72] = 0.72;
		wertungsdifferenzenTabelle[P][73] = 0.73;
		wertungsdifferenzenTabelle[P][74] = 0.74;
		wertungsdifferenzenTabelle[P][75] = 0.75;
		wertungsdifferenzenTabelle[P][76] = 0.76;
		wertungsdifferenzenTabelle[P][77] = 0.77;
		wertungsdifferenzenTabelle[P][78] = 0.78;
		wertungsdifferenzenTabelle[P][79] = 0.79;
		wertungsdifferenzenTabelle[P][80] = 0.80;
		wertungsdifferenzenTabelle[P][81] = 0.81;
		wertungsdifferenzenTabelle[P][82] = 0.82;
		wertungsdifferenzenTabelle[P][83] = 0.83;
		wertungsdifferenzenTabelle[P][84] = 0.84;
		wertungsdifferenzenTabelle[P][85] = 0.85;
		wertungsdifferenzenTabelle[P][86] = 0.86;
		wertungsdifferenzenTabelle[P][87] = 0.87;
		wertungsdifferenzenTabelle[P][88] = 0.88;
		wertungsdifferenzenTabelle[P][89] = 0.89;
		wertungsdifferenzenTabelle[P][90] = 0.90;
		wertungsdifferenzenTabelle[P][91] = 0.91;
		wertungsdifferenzenTabelle[P][92] = 0.92;
		wertungsdifferenzenTabelle[P][93] = 0.93;
		wertungsdifferenzenTabelle[P][94] = 0.94;
		wertungsdifferenzenTabelle[P][95] = 0.95;
		wertungsdifferenzenTabelle[P][96] = 0.96;
		wertungsdifferenzenTabelle[P][97] = 0.97;
		wertungsdifferenzenTabelle[P][98] = 0.98;
		wertungsdifferenzenTabelle[P][99] = 0.99;

}
	
function tabellemitDWZDifferenzenFuellen() {
		// DWZ Differenz von a bis b
		// 0 - 3
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][0] = 0;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][0] = 3;
		// 4 - 10
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][1] = 4;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][1] = 10;
		// 11 - 17
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][2] = 11;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][2] = 17;
		// 18 - 25
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][3] = 18;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][3] = 25;
		// 26 - 32
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][4] = 26;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][4] = 32;
		// 33 - 39
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][5] = 33;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][5] = 39;
		// 40 - 46
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][6] = 40;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][6] = 46;
		// 47 - 53
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][7] = 47;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][7] = 53;
		// 54 - 61
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][8] = 54;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][8] = 61;
		// 62 - 68
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][9] = 62;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][9] = 68;
		// 69 - 76
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][10] = 69;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][10] = 76;
		// 77 - 83
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][11] = 77;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][11] = 83;
		// 84 - 91
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][12] = 84;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][12] = 91;
		// 92 - 98
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][13] = 92;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][13] = 98;
		// 99 - 106
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][14] = 99;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][14] = 106;
		// 107 - 113
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][15] = 107;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][15] = 113;
		// 114 - 121
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][16] = 114;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][16] = 121;
		// 122 - 129
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][17] = 122;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][17] = 129;
		// 130 - 137
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][18] = 130;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][18] = 137;
		// 138 - 145
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][19] = 138;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][19] = 145;
		// 146 - 153
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][20] = 146;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][20] = 153;
		// 154 - 162
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][21] = 154;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][21] = 162;
		// 163 - 170
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][22] = 163;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][22] = 170;
		// 171 - 179
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][23] = 171;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][23] = 179;
		// 180 - 188
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][24] = 180;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][24] = 188;
		// 189 - 197
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][25] = 189;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][25] = 197;
		// 198 - 206
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][26] = 198;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][26] = 206;
		// 207 - 215
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][27] = 207;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][27] = 215;
		// 216 - 225
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][28] = 216;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][28] = 225;
		// 226 - 235
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][29] = 226;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][29] = 235;
		// 236 - 245
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][30] = 236;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][30] = 245;
		// 246 - 256
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][31] = 246;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][31] = 256;
		// 257 - 267
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][32] = 257;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][32] = 267;
		// 268 - 278
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][33] = 268;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][33] = 278;
		// 279 - 290
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][34] = 279;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][34] = 290;
		// 291 - 302
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][35] = 291;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][35] = 302;
		// 303 - 315
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][36] = 303;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][36] = 315;
		// 316 - 328
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][37] = 316;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][37] = 328;
		// 329 - 344
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][38] = 329;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][38] = 344;
		// 345 - 357
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][39] = 345;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][39] = 357;
		// 358 - 374
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][40] = 358;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][40] = 374;
		// 375 - 391
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][41] = 375;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][41] = 391;
		// 392 - 411
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][42] = 392;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][42] = 411;
		// 412 - 432
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][43] = 412;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][43] = 432;
		// 433 - 456
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][44] = 433;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][44] = 456;
		// 457 - 484
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][45] = 457;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][45] = 484;
		// 485 - 517
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][46] = 458;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][46] = 517;
		// 518 - 559
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][47] = 518;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][47] = 559;
		// 560 - 619
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][48] = 560;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][48] = 619;
		// 620 - 735
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_VON][49] = 620;
		wahrscheinlichkeitsTabelle[DWZ_DIFFERENZ_BIS][49] = 735;

}

function tabellemitGewinnErwartungenFuellen() {
		var counter = 0.50;
		// Wahrscheinlichkeiten
		for (var i = 0; i < 50; i++) {
			wahrscheinlichkeitsTabelle[DWZ_IST_BESSER][i] = counter;
			wahrscheinlichkeitsTabelle[DWZ_IST_SCHLECHTER][i] = 1 - counter;
			counter = counter + 0.01;
		}
}
