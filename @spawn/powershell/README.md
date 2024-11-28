# @spawn/powershell

## Overview

The `powershell` module provides a simple way to execute
PowerShell scripts or files on Windows.

The module relies upon the [@bearz/exec][exec] module and
has the same basic ussops as the `Command` and `ShellCommand` class.


## Documentation

Documentation is available on [jsr.io](https://jsr.io/@spawn/powershell/doc)

## Usage
```typescript
import { powershellScript, powershell } from "@gnome/powershell";

const cmd = await powershellScript("Write-Host 'Hello, World!'");
console.log(cmd.text());
console.log(cmd.code);

console.log(await powershellScript("Write-Host 'Hello, World!'").text());
console.log(await powershellScript("test.ps1").text()); 

// runs powershell command and writes directly to console
await powershellScript("Write-Host 'I am alive'").run();

await powershell([
    "-ExecutionPolicy",
    "Bypass", 
    "-File", "path/to/file.ps1"]).run();
```

## License

[MIT License](./LICENSE.md)

[exec]: https://jsr.io/@bearz/exec/doc