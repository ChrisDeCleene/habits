#!/bin/bash

# Pre-PR validation script
# Runs the same checks as the CI pipeline to catch issues before pushing

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Running Pre-PR Validation Checks${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print step headers
print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Track overall success
FAILED=0

# Step 1: Run linter
print_step "Step 1/4: Running linter..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    FAILED=1
fi

# Step 2: Run type check
print_step "Step 2/4: Running TypeScript type check..."
if npx tsc --noEmit; then
    print_success "Type check passed"
else
    print_error "Type check failed"
    FAILED=1
fi

# Step 3: Run tests
print_step "Step 3/4: Running tests..."
if npm run test:run; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    FAILED=1
fi

# Step 4: Run build
print_step "Step 4/4: Building project..."
if npm run build; then
    print_success "Build passed"
else
    print_error "Build failed"
    FAILED=1
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}  Your code is ready for PR${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo -e "${RED}  Please fix the issues before creating a PR${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    exit 1
fi
