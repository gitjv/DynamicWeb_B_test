﻿﻿// Gramps - a GTK+/GNOME based genealogy program
//
// Copyright (C) 2021 John Vitlin
//
// This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
// You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
//
// functions for Dynamic Web B modifications
//

function storageAvailable(type) {
    // JV taken from https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    // example use: if (storageAvailable('localStorage')) {...
    let storage;
    try {
        storage = window[type];
        let x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function lifespan_clicked() {  // JV can just redo the vital calls, as they handle lifespan limit
    vital_clicked("child");
    vital_clicked("spouse");
    vital_clicked("sibling");
    vital_clicked("parent");
}

function vital_clicked(kind) {  // JV when a vital checkbox is clicked
    let lsname = 'vital_' + kind; // works, but might be better to get the callers id
    let v_checked = $("#vital_" + kind).is(':checked');
    update_dwritem('dwr_values', lsname, v_checked);
    let ls_limit_checked = $("#lifespan").is(':checked');
    update_dwritem('dwr_values', 'lifespan', ls_limit_checked);
    // alert("'vital__clicked' " + kind + " state is " + v_checked + " and Lifespan state is " + ls_limit_checked);

    if (v_checked) {  //vital checked is true, but show or hide vitals depending on lifespan
        if (ls_limit_checked) {
            // row is vital and age in lifesp is true  - show
            var $rowsN = $("#extended_events tbody tr").filter(function () {
                return $.trim($(this).find("td").eq(2).text()) === kind && $.trim($(this).find("td").eq(1).text()) === "true";
            }).show();
            // row is vital and age in lifspan is not true - hide
            var $rowsN = $("#extended_events tbody tr").filter(function () {
                return $.trim($(this).find("td").eq(2).text()) === kind && $.trim($(this).find("td").eq(1).text()) !== "true";
            }).hide();
        } else {  // ls not limited
            // row is vital and in lifesp is true - show
            // row is vital and in lifsp is not true - show
            var $rowsN = $("#extended_events tbody tr").filter(function () {
                return $.trim($(this).find("td").eq(2).text()) === kind;
            }).show();
        }
    } else { //vital kind check is false, so hide vital kind
        var $rowsN = $("#extended_events tbody tr").filter(function () {
            return $.trim($(this).find("td").eq(2).text()) === kind;
        }).hide();
    }
}

function EEnote_clicked() {  // JV show or hide notes data (keeps the heading)
    let n_checked = $("#EEnoteCheck").is(':checked');
    update_dwritem('dwr_values', 'EEnoteCheck', n_checked);
    if (n_checked) {
        //alert ('n checked')
        $('#extended_events tbody tr td:nth-child(9)').show();
    } else {
        //alert('n not checked')
        $('#extended_events tbody tr td:nth-child(9)').hide();
    }
}

var initial_dwrvalues = {  // JV to define initial values if they don't exist in local storage yet.
    vital_child: true,
    vital_spouse: true,
    vital_sibling: true,
    vital_parent: true,
    lifespan: false,
    EEnoteCheck: true
};

function set_dwrstorage(key, obj) {  // JV
    localStorage.setItem(key, JSON.stringify(obj));
}

function get_dwrstorage(key) {  // JV get the localstorage called key, set initial if not found
    return JSON.parse(localStorage.getItem(key)) || initial_dwrvalues;
}

function update_dwritem(key, property, value) {  // JV
    if (storageAvailable('localStorage')) {
        let obj = get_dwrstorage(key);
        obj[property] = value;
        set_dwrstorage(key, obj);
    }
}

// alert("dwr B loading!");

window.onload = function () {  // JV get the values from local storage and sync display
    if ($('#extended_events').length > 0) { // if page has extended events table
        if (storageAvailable('localStorage')) {
            let stored_dwrvalues = get_dwrstorage('dwr_values');
            //alert('stored_dwrvalues is ' + JSON.stringify(stored_dwrvalues));
            $.each(stored_dwrvalues, function (key, value) {
                $("#" + key).prop("checked", value);  // set the checkbox
            });
            // fire fns to sync extended events display
            vital_clicked("child");
            vital_clicked("spouse");
            vital_clicked("sibling");
            vital_clicked("parent");
            EEnote_clicked();
        }
    }
};
