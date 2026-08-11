sampling_rates = [1, 2, 5, 10]

time_duration = 10    

data_sizes = [ ]
energy_values = [ ]

print(" Rate | Data Size | Energy | Observation ")

for rate in sampling_rates:
    data_size = rate * time_duration
    energy = data_size * 0.5
    data_sizes.append(data_size)
    energy_values.append(energy)
    if rate <= 2:
        obs = "Low"
    elif rate <= 5:
        obs = "Medium"
    else:
        obs = "High"

    print(rate, "      ", data_size, "      ", energy, "      ", obs)
print("\n Summary:")
print(" Total Data Collected : ", sum(data_sizes))
print(" Total Energy Used : ", sum(energy_values))
print("\n In comparison : ")
print(" Lowest Sampling Rate: ", min(sampling_rates))
print(" Highest Sampling Rate : ", max(sampling_rates))