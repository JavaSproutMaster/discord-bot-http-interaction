
export const assignRole = async (userId, role) => {
  let memberManager = role.guild.members;
  const member = await memberManager.fetch(userId);

  try {
    await member.roles.add(role);
  } catch (err) {
    console.log(err);
  }
}

export const getRoleId = async (guildManager, guildId, vRole) => {
  const guild = await guildManager.fetch(guildId);
  if (guild) {
    const roleManager = guild.roles;
    const existRole = roleManager.cache.find(r => r.name === vRole);
    if (!existRole) {
      roleManager.create({
        name: vRole,
        color: '#f800b0',
        reason: 'we needed a role for winners in word game...',
      }).then((newRole) => {
        return newRole;
      })
    }
    else {
      return existRole;
    }
  }
  else null;
}
