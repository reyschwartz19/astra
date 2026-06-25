import { execa } from "execa";

export const installPackages = async (packages: string[],
                                      projectPath: string, 
                                      dev: boolean = false) => {
    if (packages.length === 0) return;

    const flag = dev ? ['--save-dev'] : [];

    await execa('npm', ['install', ...flag, ...packages], { cwd: projectPath })

}