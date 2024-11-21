#!/bin/sh

# Temporary files to store PIDs and app names
pid_file=$(mktemp)
name_file=$(mktemp)

# Variable to track any errors
error_occurred=0

# Loop through each app directory
for APP in /usr/src/app/apps/*/ ; do
  # Check if schema.prisma exists
  if [ -f "${APP}/prisma/schema.prisma" ]; then
    # Run prisma generate in the background
    npx prisma generate --schema="${APP}/prisma/schema.prisma" &
    echo $! >> "$pid_file"
    basename "$APP" >> "$name_file"
  fi
done

# Determine the total number of commands issued
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
    echo "ERROR: Prisma generate failed for $app with status $status"
    error_occurred=1
  else
    echo "Prisma generate succeeded for $app"
  fi
  echo "Completed $completed of $total commands."
done

# Clean up temporary files
rm "$pid_file"
rm "$name_file"

# Exit with error if any commands failed
if [ $error_occurred -eq 1 ]; then
  echo "One or more commands failed."
  exit 1
fi

# If script reaches here, all commands were successful
echo "All commands completed successfully."
exit 0
