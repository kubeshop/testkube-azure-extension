import test from "node:test";
import assert from "node:assert/strict";
import { requiresLegacyVersionPrefix } from "./cli";

test("versions 2.4.0 and newer do not use legacy v prefix", () => {
  const nonLegacyVersions = ["2.4.0", "2.4.1", "2.10.1", "3.0.0", "10.1.0", "v2.10.1"];

  for (const version of nonLegacyVersions) {
    assert.equal(
      requiresLegacyVersionPrefix(version.replace(/^v/, "")),
      false,
      `expected ${version} to not use legacy v prefix`
    );
  }
});

test("versions before 2.4.0 use legacy v prefix", () => {
  const legacyVersions = ["0.9.0", "1.25.0", "2.3.9", "2.0.0", "2.3.0"];

  for (const version of legacyVersions) {
    assert.equal(requiresLegacyVersionPrefix(version), true, `expected ${version} to use legacy v prefix`);
  }
});

test("pre-release and build metadata are parsed correctly around boundary", () => {
  assert.equal(requiresLegacyVersionPrefix("2.4.0-rc.1"), false);
  assert.equal(requiresLegacyVersionPrefix("2.3.9+build.7"), true);
  assert.equal(requiresLegacyVersionPrefix("2.4.0"), false);
  assert.equal(requiresLegacyVersionPrefix("2.3.9"), true);
  assert.equal(requiresLegacyVersionPrefix(" 2.10.1 "), false);
});
