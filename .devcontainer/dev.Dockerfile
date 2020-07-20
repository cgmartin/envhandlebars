FROM buildpack-deps:buster-curl

ENV USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}
ARG INSTALL_ZSH="false"
ARG UPGRADE_PACKAGES="true"
ARG COMMON_SCRIPT_SOURCE="https://raw.githubusercontent.com/microsoft/vscode-dev-containers/master/script-library/common-debian.sh"
ARG COMMON_SCRIPT_SHA="dev-mode"

ARG NODE_VERSION="10.x"

ENV DEBIAN_FRONTEND=noninteractive
# Install VSCode deps
RUN apt-get update \
    && apt-get -y install --no-install-recommends curl ca-certificates 2>&1 \
    && curl -sSL ${COMMON_SCRIPT_SOURCE} -o /tmp/common-setup.sh \
    && ([ "${COMMON_SCRIPT_SHA}" = "dev-mode" ] || (echo "${COMMON_SCRIPT_SHA} */tmp/common-setup.sh" | sha256sum -c -)) \
    && /bin/bash /tmp/common-setup.sh "${INSTALL_ZSH}" "${USERNAME}" "${USER_UID}" "${USER_GID}" "${UPGRADE_PACKAGES}" \
    && rm /tmp/common-setup.sh \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Docker CE CLI
RUN apt-get update \
    && apt-get install -y apt-transport-https ca-certificates curl gnupg2 lsb-release socat 2>&1 \
    && DISTRO="$(lsb_release -is | tr '[:upper:]' '[:lower:]')" \
    && curl -fsSL https://download.docker.com/linux/${DISTRO}/gpg | apt-key add - 2>/dev/null \
    && echo "deb [arch=amd64] https://download.docker.com/linux/${DISTRO} $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends docker-ce-cli \
    # Install docker-compose
    && export LATEST_COMPOSE_VERSION=$(curl -sSL "https://api.github.com/repos/docker/compose/releases/latest" | grep -o -P '(?<="tag_name": ").+(?=")') \
    && curl -sSL "https://github.com/docker/compose/releases/download/${LATEST_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && /usr/local/bin/docker-compose --version \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -sSL "https://deb.nodesource.com/setup_${NODE_VERSION}" | /bin/bash - \
    && apt-get update \
    && apt-get -y install --no-install-recommends nodejs build-essential 2>&1 \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

ENV DEBIAN_FRONTEND=dialog

# Save Bash History
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && echo $SNIPPET >> /root/.bashrc \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R ${USERNAME} /commandhistory \
    && echo $SNIPPET >> "/home/${USERNAME}/.bashrc" \
    && chown -R ${USERNAME} "/home/${USERNAME}" \
    && touch /var/run/docker-host.sock \
    && ln -s /var/run/docker-host.sock /var/run/docker.sock

ADD docker-init.sh /usr/local/share/

ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]