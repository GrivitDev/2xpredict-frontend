import {
  suspendUser,
  activateUser,
  deleteUser,
  forceLogout,
} from '@/services/admin-users.service';

export  function useUserActions(
  userId: string,
  onSuccess?: () => void
) {
  const suspend = async (reason: string, bannedUntil?: Date) => {
    await suspendUser(userId, { reason, bannedUntil });
    onSuccess?.();
  };

  const activate = async () => {
    await activateUser(userId);
    onSuccess?.();
  };

  const remove = async () => {
    await deleteUser(userId);
    onSuccess?.();
  };

const forceLogoutAllDevices =
  async () => {
    await forceLogout(userId);
  };

  return { suspend, activate, remove, forceLogoutAllDevices };
}