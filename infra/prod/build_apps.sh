#!/bin/sh

# Temporary files to store PIDs and app names
pid_file=$(mktemp)
name_file=$(mktemp)

# Variable to track any build failures
error_occurred=0

# Loop through each app directory
for APP_PATH in /usr/src/app/apps/*/ ; do
  APP=$(basename "$APP_PATH")
  # Run npm build in the background for each app
  npm run build "$APP" && cp -R ./resources ./dist &
  echo $! >> "$pid_file"
  echo "$APP" >> "$name_file"
done

# Determine total number of builds
total=$(wc -l < "$pid_file")
completed=0

# Wait for all background jobs to finish and check their exit status
exec 3<"$pid_file"
exec 4<"$name_file"

while read pid <&3 && read app <&4; do
  wait "$pid"
  status=$?
  completed=$((completed + 1))
  if [ $status -ne 0 ]; then
    echo "ERROR: Build failed for $app with status $status"
    error_occurred=1
  else
    echo "Build succeeded for $app"
  fi
  echo "Completed $completed of $total builds."
done

# Clean up temporary files
rm "$pid_file"
rm "$name_file"

# Exit with error if any builds failed
if [ $error_occurred -eq 1 ]; then
  echo "One or more builds failed."
  exit 1
fi

# If script reaches here, all builds were successful
echo "All builds completed successfully."
exit 0
