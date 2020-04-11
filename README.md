# SinusBot-CoverLoader

Updated version of the CoverLoader script by Kevin Händel to work with SinusBot v1.0.0

You can use this script just like the original. To update the script please do the following steps:
- download the script 
- replace the original in your sinusbot/scripts folder.
- restart your sinusbot service to reload all scripts 
- re-enable the script

The settings are the same as in the original script.

**Hint**
Unlike the original, this version of the script will set the avatar to the current track thumbnail in the SinusBot library (or nothing if the track has no thumbnail) if no thumbnail couldn't be found on Deezer.
If you don't want this, and want to restore the original behaviour please remove the lines 92-94 and 151-153 from the script before you upload the file to your sinusbot/scripts directory.
