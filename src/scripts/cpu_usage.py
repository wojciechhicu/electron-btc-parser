import psutil

def get_cpu_usage(numero):
    cpu_percent = psutil.cpu_percent(interval=numero)
    return str(cpu_percent)

var = get_cpu_usage(1)
print( var)