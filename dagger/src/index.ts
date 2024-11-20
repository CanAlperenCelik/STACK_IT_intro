/**
 * A generated module for StackItIntro functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */
import {
  dag,
  Container,
  Directory,
  object,
  func,
  Service,
} from "@dagger.io/dagger";

@object()
export class StackItIntro {
  @func()
  buildEnv(source: Directory): Container {
    // create a Dagger cache volume for dependencies
    return (
      dag
        .container()
        // start from a base Node.js container
        .from("node:21-slim")
        // add the source code at /src
        .withDirectory("/src", source)
        // mount the cache volume at /root/.npm
        // change the working directory to /src
        .withWorkdir("/src")
        // run npm install to install dependencies
        .withExec(["npm", "install"])
    );
  }

  @func()
  build(source: Directory): Container {
    // get the build environment container
    // by calling another Dagger Function
    const build = this.buildEnv(source)
      // build the application
      .withExec(["npm", "run", "build"])
      // get the build output directory
      .directory("./dist");
    return (
      dag
        .container()
        // start from a slim NGINX container
        .from("nginx:1.25-alpine")
        // copy the build output directory to the container
        .withDirectory("/usr/share/nginx/html", build)
        // expose the container port
        .withExposedPort(80)
    );
  }

  @func()
  async test(source: Directory): Promise<Service> {
    return this.build(source).asService();
  }

  @func()
  async publish(source: Directory, address: string): Promise<string> {
    return this.build(source).publish(address);
  }
}
