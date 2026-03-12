export function useGetters(getterMap) {
  const store = useStore();
  const res = {};

  Object.keys(getterMap).forEach(key => {
    const getterName = getterMap[key];
    res[key] = computed(() => store.getters[getterName]);
  });

  return res;
}
