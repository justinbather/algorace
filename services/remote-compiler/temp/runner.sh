#!/bin/bash
# This script carries out the operations required to compile a users code and compare to the test cases
# Called by the container upon start up in DockerCompiler.js:execute()

#We run the users code and compare the output to the test case expected output
#if equal we write it to output.txt
# if all equal we rename output.txt to success.txt
# else write it to output and rename to errors.txt
# there is a setInterval() waiting for a success or error file to be written

#File to read test cases from
# Contains test_id,input,expected_output
fileName=$1
executor=$2

INFILE=$(pwd)/test.txt

# Execute the 'test.mjs' script and capture its output in 'x'
x=$($executor $fileName 2>stderr.log)
# Check if stderr.log is not empty (contains error output)
if [ -s "stderr.log" ]; then
	# Print the error messages and exit
	echo "Error in test.mjs: $(cat stderr.log)"
	mv stderr.log errors.txt
	exit 1
fi

# Initialize line numbers
line_number=1

while IFS='' read -r LINE || [ -n "${LINE}" ]; do
	IFS='-' read -ra values <<<"$LINE"
	test_id="${values[0]}"
	expected="${values[1]}"

	# Retrieve the corresponding line from 'x' (stdout)
	x_line=$(sed "${line_number}q;d" <<<"$x")

	# We need to exit out if stderr is printed to log
	if [ -n "$(cat stderr.log)" ]; then
		echo "Error in test.mjs: $(cat stderr.log)"
		mv stderr.log errors.txt
		exit 1
	fi

	# Compare expected output from the test.mjs with user code result
	if [[ "$x_line" == "$expected" ]]; then
		echo "$test_id,$x_line,$expected" >>output.txt

	else
		echo "expected -> $expected" >>output.txt

		echo "returned -> $x_line" >>output.txt
		mv output.txt errors.txt
		exit 1
	fi

	# Increment the line number for the next comparison
	((line_number++))
done <"$INFILE"

mv output.txt success.txt

#Clean up
rm stderr.log
rm test.mjs
rm test.txt
rm *.input.mjs
