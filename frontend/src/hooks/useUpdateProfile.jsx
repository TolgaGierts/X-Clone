import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      Promise.all([queryClient.invalidateQueries({ queryKey: ['authUser'] })]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { updateProfile, isUpdating };
};

export default useUpdateProfile;
