import {useAppSelector} from "@/src/stores/store.ts";
import {trpc} from "@/src/util/trpc.ts";
import {notifications} from "@mantine/notifications";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";

export function UseCreatePlant() {
    const mutation = trpc.plant.create.useMutation();
    const tags = useAppSelector((state) => state.newPlantReducer.tags);
    const name = useAppSelector((state) => state.newPlantReducer.name);
    const description = useAppSelector(
        (state) => state.newPlantReducer.description,
    );
    const wateringFrequency = useAppSelector(
        (state) => state.newPlantReducer.wateringFrequency,
    );

    return () => {
        const promise = mutation.mutateAsync({
                name,
                description,
                watering_frequency:
                    typeof wateringFrequency === 'string'
                        ? parseInt(wateringFrequency)
                        : wateringFrequency,
                tags,
            });
        promise.then(() => {
            notifications.show({
                title: 'Success!',
                message: 'Added a new plant!',
                color: 'green',
                position: 'top-center',
                icon: <FontAwesomeIcon color={'white'} icon={faCheck}></FontAwesomeIcon>,
                autoClose: 2000,
            });
        })
        return promise;
    }
}