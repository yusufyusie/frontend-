import { Map, LayoutGrid, MapPin } from 'lucide-react';
import { LandResourceType } from '../../../services/land-resources.service';

interface Props {
    type: LandResourceType;
    size?: number;
}

export const ResourceIcon = ({ type, size = 18 }: Props) => {
    switch (type) {
        case LandResourceType.ZONE:
            return <Map size={size} className="text-blue-600" />;
        case LandResourceType.BLOCK:
            return <LayoutGrid size={size} className="text-orange-500" />;
        case LandResourceType.PLOT:
            return <MapPin size={size} className="text-green-600" />;
        default:
            return <Map size={size} />;
    }
};
