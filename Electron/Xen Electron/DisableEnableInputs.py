import time
import pyHook 
from threading import Timer
import win32gui
import pythoncom
import ctypes
import win32api
import win32con
import sys
import json

timeToQuit = sys.argv[1]

main_thread_id = win32api.GetCurrentThreadId()

def Event(event):
  return False
  
def quit():
  win32api.PostThreadMessage(main_thread_id, win32con.WM_QUIT, 0, 0)
    
hookManager = pyHook.HookManager() 
hookManager.KeyAll = Event
hookManager.MouseAll = Event
hookManager.HookMouse()
hookManager.HookKeyboard() 
timer= Timer(float(timeToQuit),quit)
timer.start()
pythoncom.PumpMessages()
sys.stdout.flush()
