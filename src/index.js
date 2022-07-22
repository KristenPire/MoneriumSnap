module.exports.onRpcRequest = async ({ origin, request }) => {
  let access_token = "";
  let metamaskAccount = "";

  switch (request.method) {
  case 'linkToMonerium':
    return await linkToMonerium();
  case 'connectToMonnerium':
    const response = await wallet.request({
      method: 'wallet_requestPermissions',
      params: [{
        'eth_accounts': {},
      }]
    })
    metamaskAccount = response.find((permission) => permission.parentCapability === "eth_accounts")?.caveats?.[0]?.value?.[0]
    return await connectToMonerium();
  case 'hello':
    return wallet.request({
      method: 'snap_confirm',
      params: [
        {
          prompt: `Hello, ${origin}!`,
          description:
          'This custom confirmation is just for display purposes.',
          textAreaContent:
          'But you can edit the snap source code to make it do something, if you want to!',
        },
      ],
    });
  default:
    throw new Error('Method not found.');
  }

  async function getAccessToken() {
    return access_token;
  }

  async function connectToMonerium() {
    let response = await fetch("https://api.monerium.dev/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "client_id=1b3a17ef-460f-47b0-84c6-4495e18589b3&client_secret=samplepassword&grant_type=client_credentials"
    })
    const res = await response.json()
    access_token = res.access_token;
    let context = await fetchContext()
    let profile = await fetchProfile(context.defaultProfile)
    profile.isLinked = !!profile.accounts.find((item) => item.address === metamaskAccount);
    profile.metamaskAddress = metamaskAccount;
    profile.token = access_token;
    return profile;
  };

  async function linkToMonerium() {
    let message = "a very small example";
    message.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
    const response = await wallet.request({
      method: 'eth_sign',
      params: [{from: metamaskAccount},
                 message
              ]
    })
    return await response.json();
  }

  async function fetchContext() {
    let response = await fetch("https://api.monerium.dev/auth/context", {
      headers: {
        "Authorization": "Bearer " + access_token,
      },
    })
    return await response.json();
  };

  async function fetchProfile(profileId) {
    let response = await fetch(`https://api.monerium.dev/profiles/${profileId}`, {
      headers: {
        "Authorization": "Bearer " + access_token,
      },
    })
    return await response.json();
  };

};
