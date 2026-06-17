import SectionLayout from '../layout/SectionLayout'
import BenefitsSection from '../components/demo/BenefitsSection'
import DemoSection from '../components/demo/DemoSection'

export default function Demo() {
    return (
        <SectionLayout
            id="demo"
            className="bg-surface">

            { /* First section */}
            <BenefitsSection />

            { /* Second section */}
            <DemoSection />

        </SectionLayout>
    )
}