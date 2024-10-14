
export async function editMessage(channelManager, channelId, messageId, component) { 
  const channel = await channelManager.fetch(channelId);
  const message = await channel.messages.fetch(messageId);
  await message.edit(component);
}
