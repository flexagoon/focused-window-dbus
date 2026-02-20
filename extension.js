import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';

const DBUS_SCHEMA = `
<node>
    <interface name="org.gnome.shell.extensions.FocusedWindow">
        <method name="Get">
            <arg type="s" direction="out" name="window" />
        </method>
    </interface>
</node>`;

// Check if a window has a valid logical monitor.
// The get_work_area_* methods will trigger a fatal assertion in Mutter if the window's
// logical monitor is null. This can happen during monitor hotplug, display reconfiguration,
// or when windows are in transient states. We MUST check this BEFORE calling those methods
// because the assertion calls abort() at the C level, which cannot be caught by JavaScript try/catch.
// See: https://github.com/flexagoon/focused-window-dbus/pull/12
function hasValidMonitor(metaWindow) {
  const windowMonitor = metaWindow.get_monitor();
  // Monitor index is -1 if the window has no monitor assigned
  if (windowMonitor < 0) {
    return false;
  }
  // Also verify the monitor index is within bounds
  const numMonitors = global.display.get_n_monitors();
  if (windowMonitor >= numMonitors) {
    return false;
  }
  return true;
}

export default class FocusedWindowDbus extends Extension {
  Get() {
    let window_list = global.get_window_actors();
    let focusedWindow = window_list.find((window) =>
      window.meta_window.has_focus()
    );

    // Stolen from the "Window Calls" extension
    // https://github.com/ickyicky/window-calls/blob/b5ac7abe7e7acfcced75c5139824bd434d7c8f89/extension.js#L129
    let workspaceManager = global.workspace_manager;
    let currentmonitor = global.display.get_current_monitor();
    if (focusedWindow) {
      const validMonitor = hasValidMonitor(focusedWindow.meta_window);

      return JSON.stringify({
        title: focusedWindow.meta_window.get_title(),
        wm_class: focusedWindow.meta_window.get_wm_class(),
        wm_class_instance: focusedWindow.meta_window.get_wm_class_instance(),
        pid: focusedWindow.meta_window.get_pid(),
        id: focusedWindow.meta_window.get_id(),
        width: focusedWindow.get_width(),
        height: focusedWindow.get_height(),
        x: focusedWindow.get_x(),
        y: focusedWindow.get_y(),
        focus: focusedWindow.meta_window.has_focus(),
        in_current_workspace: focusedWindow.meta_window.located_on_workspace(
          workspaceManager.get_active_workspace()
        ),
        moveable: focusedWindow.meta_window.allows_move(),
        resizeable: focusedWindow.meta_window.allows_resize(),
        canclose: focusedWindow.meta_window.can_close(),
        canmaximize: focusedWindow.meta_window.can_maximize(),
        maximized: focusedWindow.meta_window.is_maximized(),
        canminimize: focusedWindow.meta_window.can_minimize(),
        display: focusedWindow.meta_window.get_display(),
        frame_type: focusedWindow.meta_window.get_frame_type(),
        window_type: focusedWindow.meta_window.get_window_type(),
        layer: focusedWindow.meta_window.get_layer(),
        monitor: focusedWindow.meta_window.get_monitor(),
        role: focusedWindow.meta_window.get_role(),
        // Only call work area methods if window has a valid monitor
        area: validMonitor ? focusedWindow.meta_window.get_work_area_current_monitor() : null,
        area_all: validMonitor ? focusedWindow.meta_window.get_work_area_all_monitors() : null,
        area_cust: validMonitor ? focusedWindow.meta_window.get_work_area_for_monitor(currentmonitor) : null,
      });
    } else {
      return "{}";
    }
  }

  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(DBUS_SCHEMA, this);
    this._dbus.export(
      Gio.DBus.session,
      "/org/gnome/shell/extensions/FocusedWindow"
    );
  }

  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    delete this._dbus;
  }
}
