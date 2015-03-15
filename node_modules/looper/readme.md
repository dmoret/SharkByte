looper.js - fluid function runner

looper.js provides a way for javascript developers to create isolated, heavily controllable execution environments to run continuous processes. looking at it from a low level perspective, it acts as a complex recursive setTimeout, with its base functionality being the execution of a chain of functions. 

from a developer’s perspective you are gaining the ability to run a series of functions, with varying delay times when needed, as well as the ability to bidirectionally control its execution process. similar to something like controls for a video player, at any time during your execution process you can do things like: start, stop, pause, play, replay, rewind, fast forward, and more. you can also provide callbacks to execute before and after each function as well as before and after each execution process.

written with vanilla javascript, this tool can be applied on the front end of a site as well as on the backend using systems such as node.js. further, by having the ability to control your function chain throughout its execution you can help to avoid the usual async concerns such as large sets of nested callbacks and timing issues. 

Copyright (C) 2015  Michael A Sirizzotti
Looper.js by mikesizz
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; only version 2 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
