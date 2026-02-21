# Focused window D-Bus

This GNOME Shell extension allows you to get the currently focused window using
a D-Bus call. This allows you to get the focused window on Wayland, where there
is no other way to do this.

# Installation

You can install this extension from Gnome Extensions

https://extensions.gnome.org/extension/5592/focused-window-d-bus

# Usage

Getting the current focused window:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/shell/extensions/FocusedWindow --method org.gnome.shell.extensions.FocusedWindow.Get
```

Subscribing to window focus changes:

```sh
gdbus monitor --session --dest org.gnome.Shell --object-path /org/gnome/shell/extensions/FocusedWindow
```

Return format example:

```json
{
  "title": "Calculator",
  "wm_class": "org.gnome.Calculator",
  "wm_class_instance": "org.gnome.Calculator",
  "pid": 56643,
  "id": 2274918779,
  "width": 421,
  "height": 560,
  "x": -22,
  "y": -3,
  "focus": true,
  "in_current_workspace": true,
  "moveable": true,
  "resizeable": true,
  "canclose": true,
  "canmaximize": true,
  "maximized": false,
  "canminimize": true,
  "display": {},
  "frame_type": 0,
  "window_type": 0,
  "layer": 2,
  "monitor": 0,
  "role": null,
  "area": {},
  "area_all": {},
  "area_cust": {}
}
```
