/**
 * This is the main frontend file to make an interactive ui for gdb.
 *
 * There are several top-level components, most of which can render new html in the browser.
 *
 * store (global state) is managed in a single location, and each time the store
 * changes, an event is emitted, which Components listen for. Each Component then re-renders itself
 * as necessary.
 *
 */

import {store, initial_store_data} from './store.js';
import ReactDOM from 'react-dom';
import React from 'react';
import StatusBar from './StatusBar.jsx';
import BinaryLoader from './BinaryLoader.js';
import GlobalEvents from './GlobalEvents.js';
import SourceCode from './SourceCode.jsx';
import Breakpoint from './Breakpoint.jsx';
import Tree from './Tree.js';
import Registers from './Registers.js';
import GdbMiOutput from './GdbMiOutput.js';
import Settings from './Settings.jsx';
import Modal from './Modal.js';
import Threads from './Threads.js';
import GdbCommandInput from './GdbCommandInput.js';
import {Expressions, Locals, HoverVar} from './Variables.js';
import GdbConsoleComponent from './GdbConsole.js';
import Memory from './Memory.js';
import GdbApi from './GdbApi.js';
import SourceFileAutocomplete from './SourceFileAutocomplete.js';

 /* global Split */
 /* global debug */
 /* global initial_data */

window.store = (function ($, _, Split, debug, initial_data) {
"use strict";

store.options.debug = debug
store.initialize(initial_store_data)

/**
 * Component with checkboxes that allow the user to show/hide various components
 */
const VisibilityToggler = {
    /**
     * Set up events and render checkboxes
     */
    init: function(){
        $("body").on("click", ".visibility_toggler", VisibilityToggler.click_visibility_toggler)
    },
    /**
     * Update visibility of components as defined by
     * the checkboxes
     */
    click_visibility_toggler: function(e){
        if(e.target.classList.contains('glyphicon-ban-circle') || e.target.classList.contains('btn')){
            // don't toggle visibility if the clear button was pressed
            return
        }

        // toggle visiblity of target
        $(e.currentTarget.dataset.visibility_target_selector_string).toggleClass('hidden')

        // make triangle point down or to the right
        let is_hidden = $(e.currentTarget.dataset.visibility_target_selector_string).hasClass('hidden')
        if(is_hidden){
            $(e.currentTarget.dataset.glyph_selector).addClass('glyphicon-chevron-right').removeClass('glyphicon-chevron-down')
        }else{
            $(e.currentTarget.dataset.glyph_selector).addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-right')
        }
    }
}

/**
 * Component to shutdown gdbgui
 */
const ShutdownGdbgui = {
    /**
     * Set up events and render checkboxes
     */
    init: function(){
        document.getElementById('shutdown_gdbgui').onclick = ShutdownGdbgui.click_shutdown_button
    },
    click_shutdown_button: function(){
        // no need to show confirmation before leaving, because we're about to prompt the user
        window.onbeforeunload = () => null
        // prompt user
        if (window.confirm('This will terminate the gdbgui for all browser tabs running gdbgui (and their gdb processes). Continue?') === true) {
            // user wants to shutdown, redirect them to the shutdown page
            window.location = '/shutdown'
        } else {
            // re-add confirmation before leaving page (when user actually leaves at a later time)
            window.onbeforeunload = () => 'some text'
        }
    },
}

/**
 * Split the body into different panes using splitjs (https://github.com/nathancahill/Split.js)
 */
Split(['#middle_left', '#middle_right'], {
    gutterSize: 8,
    cursor: 'col-resize',
    direction: 'horizontal',  // horizontal makes a left/right pane, and a divider running vertically
    sizes: [70, 30],
})

Split(['#middle', '#bottom'], {
    gutterSize: 8,
    cursor: 'row-resize',
    direction: 'vertical',  // vertical makes a top and bottom pane, and a divider running horizontally
    sizes: [70, 30],
})

// initialize components
void(React)  // ReactDOM secretly depends on React; avoid "'React' is defined but never used  no-unused-vars"
ReactDOM.render(<StatusBar/>, document.getElementById('status'))
// TODO make all these into react components
// TODO remove jquery dependency
GlobalEvents.init()
GdbApi.init()
GdbCommandInput.init()
Modal.init()
GdbConsoleComponent.init()
GdbMiOutput.init()
SourceCode.init()
Breakpoint.init()
BinaryLoader.init()
Registers.init()
SourceFileAutocomplete.init()
Memory.init()
Expressions.init()
Tree.init()
HoverVar.init()
Locals.init()
Threads.init()
VisibilityToggler.init()
ShutdownGdbgui.init()
Settings.init()

window.addEventListener("beforeunload", GdbCommandInput.shutdown)
window.onbeforeunload = () => ('text here makes dialog appear when exiting. Set function to back to null for nomal behavior.')

// and finally, if user supplied an initial command, set it in the UI, and load the
// inferior binary
if(_.isString(initial_data.initial_binary_and_args) && _.trim(initial_data.initial_binary_and_args).length > 0){
    BinaryLoader.el.val(_.trim(initial_data.initial_binary_and_args))
    BinaryLoader.set_target_app()
}

return store
})(jQuery, _, Split, debug, initial_data)
