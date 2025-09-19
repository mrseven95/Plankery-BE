export function getUserId(user: any): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (user?._id) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return user._id.toString();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (user?.id) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return user.id.toString();
  }
  throw new Error('User ID not found');
}
