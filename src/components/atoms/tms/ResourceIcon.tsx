import { Map, LayoutGrid, MapPin, DoorOpen } from 'lucide-react';
import { LocationLevel } from '../../../services/land-resources.service';

interface Props {
    type: LocationLevel;
    size?: number;
}

export const ResourceIcon = ({ type, size = 18 }: Props) => {
    switch (type) {
        case LocationLevel.ZONE:
            return <Map size={size} className="text-blue-600" />;
        case LocationLevel.BLOCK:
            return <LayoutGrid size={size} className="text-orange-500" />;
        case LocationLevel.PLOT:
            return <MapPin size={size} className="text-green-600" />;
        case LocationLevel.ROOM:
            return <DoorOpen size={size} className="text-indigo-600" />;
        default:
            return <Map size={size} />;
    }
};
