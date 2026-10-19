import Seo from '../components/ui/Seo.jsx';
import { directoryConfigs } from '../components/sections/directory/directoryConfigs.js';
import DirectoryHero from '../components/sections/directory/DirectoryHero.jsx';
import DirectoryItems from '../components/sections/directory/DirectoryItems.jsx';
import DirectoryCTA from '../components/sections/directory/DirectoryCTA.jsx';

export default function ContentDirectory({ type }) {
	const config = directoryConfigs[type];

	if (!config) {
		return null;
	}

	return (
		<>
			<Seo
				title={config.title}
				description={config.description}
				path={`/${type}`}
			/>

			<DirectoryHero config={config} type={type} />

			<section className="bg-white py-16 sm:py-20">
				<div className="container-premium">
					<DirectoryItems config={config} />
					<DirectoryCTA config={config} />
				</div>
			</section>
		</>
	);
}
