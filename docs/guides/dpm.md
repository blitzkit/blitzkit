# Damage Per Minute (DPM)

The damage per minute of a tank is the average damage that can be dealt in that tank with the first shell (usually AP) in 60 seconds.

## Regular and Auto Loaders

The damage per minute for these types of guns are calculated by allowing the gun to shoot as soon as the shell is loaded (and in the case of auto loaders, the clip is dumped as fast as the inter-clip time will allow).

## Auto Reloaders

These types of guns have 3 DPM values.

- Damage per minute: calculated if you were to treat the shells like a normal auto loader where you dump all shells, wait for all shells to reload, and repeat.
- Maximum: some tanks gain DPM the deeper they go into the clip and others maintain a higher DPM the less shells used. The "maximum" DPM is calculated if you were to treat the gun as a single-shot regular gun with the shell with the lowest reload. The shell with the highest DPM is listed as "Optimal shell index."
- Effective: this is the maximum DPM tacked on with dumping the remaining shells at the beginning or the end of the 60 seconds.
  - If "Optimal shell index" is 1, the clip must be dumped first then used as a single shot.
  - If "Optimal shell index" is any other number, the gun should be treated as a single shot then dumped for the highest effective DPM.
