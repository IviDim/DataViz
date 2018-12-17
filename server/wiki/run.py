'''
This script downloads the total files from wikipedi page.
'''
from tqdm import tqdm
import re
import os

character_to_month = {
    "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7, "H": 8, "I": 9, "J": 10, "K": 11, "L": 12, "M": 13, "N": 14,
    "O": 15, "P": 16, "Q": 17, "R": 18, "S": 19, "T": 20, "U": 21, "V": 22, "W": 23, "X": 24, "Y": 25, "Z": 26, "[": 27,
    "\\": 28, "]": 29, "^": 30, r"_": 31
}

# Match for numbers, compile here for perfromance reasons
pattern = re.compile(r"\d+")

def month_day_count(one_day):
    last_letter_index = 1  # because the first one is the day in month
    numbers = re.findall(pattern, one_day)
    total_sum = sum(map(lambda x: int(x), numbers))
    return (character_to_month[one_day[0]], total_sum)


def sum_and_peak_day(encoded_time):
    by_month = encoded_time.split(",")
    all_sum = [month_day_count(i) for i in by_month[:-1]]
    peak_day = max(all_sum, key=lambda x: x[1])[0]
    total_sum = sum(map(lambda x: x[1], all_sum))
    return (peak_day, total_sum)


def clean_file(input_file, output_file):
    with open(file) as iput:
        with open(output, 'w') as output:
            for line in tqdm(input):
                splits = line.split(' ')
                title = splits[1]
                count = splits[2]
                time = splits[3]
                peak_day, total_sum = sum_and_peak_day(time)
                assert total_sum != count, "{} {}".format(total_sum, count)

                if (total_sum >= 10000):
                    output_file.write("{};{};{}\n".format(title, count, peak_day))

def main():
    for file in tqdm(os.listdir('.')):
        clean_file(file, )
        print(files)

if __name__ == "__main__":
    main()


